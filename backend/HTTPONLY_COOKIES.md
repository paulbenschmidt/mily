# httpOnly Cookie Authentication

Mily now uses **backend-set httpOnly cookies** for JWT token storage, providing enhanced security against XSS attacks.

## Security Benefits

✅ **XSS Protection**: JavaScript cannot access httpOnly cookies  
✅ **Automatic Management**: Browser handles cookie lifecycle  
✅ **CSRF Mitigation**: SameSite=Lax prevents cross-site attacks  
✅ **Secure in Production**: Cookies only sent over HTTPS when `DEBUG=False`

## How It Works

### **Backend (Django)**

**Login/Email Verification** - Sets httpOnly cookies:
```python
response.set_cookie(
    key='access_token',
    value=access_token,
    max_age=60 * 60,  # 1 hour
    httponly=True,
    secure=is_production,  # HTTPS only in production
    samesite='Lax',
    path='/',
)
```

**Token Refresh** - `CookieTokenRefreshView`:
- Reads refresh token from httpOnly cookie
- Validates and generates new access token
- Sets new access token in httpOnly cookie

**Logout** - Clears httpOnly cookies:
```python
response.delete_cookie('access_token', path='/', samesite='Lax')
response.delete_cookie('refresh_token', path='/', samesite='Lax')
```

### **Frontend (Next.js)**

**No Token Management Needed**:
- Tokens automatically sent with `credentials: 'include'`
- No JavaScript access to tokens
- Automatic token refresh on 401 errors

```typescript
// Tokens are sent automatically via cookies
fetch('/api/users/me/', {
  credentials: 'include',  // Send httpOnly cookies
});
```

## Token Lifetimes

- **Access Token**: 1 hour
- **Refresh Token**: 7 days

## Cookie Settings

| Setting | Value | Purpose |
|---------|-------|---------|
| `httponly` | `True` | Prevents JavaScript access |
| `secure` | `True` (prod) | HTTPS only in production |
| `samesite` | `Lax` | CSRF protection |
| `path` | `/` | Available to all routes |

## Development vs Production

**Development** (`DEBUG=True`):
- `secure=False` - Works with HTTP (localhost)
- Cookies still httpOnly for testing

**Production** (`DEBUG=False`):
- `secure=True` - HTTPS required
- Full security enabled

## Migration from Client-Side Cookies

**Before** (Client-Side):
```typescript
// Frontend managed tokens
document.cookie = `access_token=${token}; Secure`;
const token = getTokenFromCookie('access_token');
```

**After** (httpOnly):
```typescript
// Backend manages tokens automatically
// Frontend just includes credentials
fetch(url, { credentials: 'include' });
```

## Testing

**Login**:
```bash
curl -X POST http://localhost:8000/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  -c cookies.txt  # Save cookies
```

**Authenticated Request**:
```bash
curl http://localhost:8000/api/users/me/ \
  -b cookies.txt  # Send cookies
```

**Token Refresh**:
```bash
curl -X POST http://localhost:8000/api/auth/token/refresh/ \
  -b cookies.txt \
  -c cookies.txt  # Update cookies
```

## Security Considerations

✅ **XSS Protection**: httpOnly cookies can't be stolen by malicious scripts  
✅ **CSRF Protection**: SameSite=Lax prevents most CSRF attacks  
⚠️ **HTTPS Required**: Always use HTTPS in production  
⚠️ **Cookie Scope**: Cookies sent to all same-origin requests

## Troubleshooting

**Cookies not being set?**
- Check `credentials: 'include'` in fetch requests
- Verify CORS settings allow credentials
- Ensure same-origin or proper CORS headers

**401 errors after login?**
- Check browser DevTools → Application → Cookies
- Verify cookies have correct domain and path
- Check if cookies expired

**Token refresh not working?**
- Verify refresh_token cookie exists
- Check CookieTokenRefreshView is being used
- Ensure credentials are included in refresh request
