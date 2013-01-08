sse-chat
========

Chat server based on Server-Sent Events protocol.

Featured:
- multiple channels, multiple sessions
- PIN protection (complementary to password or SMS-reset)


Apache configuration: 
- enable LoadModule 'mod_proxy.so' and 'mod_proxy_http.so'
- add directove ProxyPass <dir>/server/ http://localhost:8002/

