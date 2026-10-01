api:
	(cd server && make swag)
	(cd client && npm run gen:api)