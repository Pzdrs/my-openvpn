package controller

import (
	"errors"
	"net/http"
	"strconv"

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
