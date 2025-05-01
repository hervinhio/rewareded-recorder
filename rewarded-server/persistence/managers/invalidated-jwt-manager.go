package managers

type InvalidatedJwtManager interface {
	IsInvalidated(jwt string) (bool, error)
	InvalidateToken(jwt string) error
}
