package controller

import (
	"database/sql"
	"encoding/base64"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"pycrs.cz/openvpn-client-zone/internal/model"
	"pycrs.cz/openvpn-client-zone/internal/rest/dto"
	"pycrs.cz/openvpn-client-zone/internal/rest/problem"
	"pycrs.cz/openvpn-client-zone/internal/rest/utils"
	"pycrs.cz/openvpn-client-zone/internal/service"
)

type ServerController struct {
	s *service.ServerService
}

func NewServerController(s *service.ServerService) *ServerController {
	return &ServerController{
		s: s,
	}
}

// HandleUserServers handles the request to get user servers.
//
//	@Summary	Get servers that the user has access to
//	@Id			GetUserServers
//	@Tags		servers
//	@Success	200	{array}	dto.Server
//	@Router		/servers [get]
func (c *ServerController) HandleUserServers(w http.ResponseWriter, r *http.Request) {
	claims, ok := service.GetTokenClaims(r.Context())
	if !ok {
		problem.Write(
			w, problem.NewInternalServerError(r, errors.New("failed to retrieve token claims")),
		)
		return
	}

	uid, err := strconv.Atoi(claims.Subject)
	if err != nil {
		problem.Write(
			w, problem.NewInternalServerError(r, err),
		)
		return
	}

	servers, err := c.s.GetUserServers(r.Context(), int32(uid))
	if err != nil {
		problem.Write(
			w, problem.NewInternalServerError(r, err),
		)
		return
	}

	serversValue := make([]model.Server, len(servers))
	for i, s := range servers {
		serversValue[i] = *s
	}

	utils.Encode(w, r, http.StatusOK, dto.ServersModelToDTO(serversValue))
}

// HandleDownloadProfile handles the request to download a server profile.
//
//	@Summary	Download server profile
//	@Id			DownloadServerProfile
//	@Tags		servers
//	@Param		serverId	path	int	true	"Server ID"
//	@Produce	octet-stream
//	@Success	200	{file}	binary	"File stream"
//	@Router		/servers/{serverId}/profile [get]
func (c *ServerController) HandleDownloadProfile(w http.ResponseWriter, r *http.Request) {
	serverID, err := strconv.ParseInt(chi.URLParam(r, "serverID"), 10, 32)
	if err != nil {
		problem.Write(w, problem.NewBadRequest(r, errors.New("Invalid server ID")))
		return
	}

	profile, err := c.s.GetServerProfile(r.Context(), int32(serverID))
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			problem.Write(
				w, problem.NewNotFound(r, errors.New("Profile not found")),
			)
			return
		}

		problem.Write(
			w, problem.NewInternalServerError(r, err),
		)
		return
	}

	w.Header().Set("Content-Type", "text/plain")
	w.Header().Set("Content-Disposition", "attachment; filename=profile.ovpn")
	w.Header().Set("Content-Length", strconv.Itoa(len(profile.Data)))

	flusher, ok := w.(http.Flusher)
	if ok {
		flusher.Flush()
	}

	w.Write([]byte(profile.Data))

	w.WriteHeader(http.StatusOK)
}

// HandleUpdateProfile handles the request to update a server profile.
//
//	@Summary	Update server profile
//	@Id			UpdateServerProfile
//	@Tags		servers
//	@Param		serverId	path	int							true	"Server ID"
//	@Param		profile		body	dto.UpdateProfileRequest	true	"Profile data"
//	@Success	204
//	@Router		/servers/{serverId}/profile [post]
func (c *ServerController) HandleUpdateProfile(w http.ResponseWriter, r *http.Request) {
	req, ok := utils.DecodeValidate[dto.UpdateProfileRequest](w, r)
	if !ok {
		return
	}
	
	profileData, err := base64.StdEncoding.DecodeString(req.ProfileData)
	if err != nil {
		problem.Write(w, problem.NewInternalServerError(r, errors.New("Invalid profile data")))
		return
	}

	fmt.Println(string(profileData))
}
