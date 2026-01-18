from django.urls import path, include

urlpatterns = [
    path('api/', include('watchlist.urls')),
]

# Integration note:
# If ingress routing is required, add a rule that forwards requests
# for the watchlist service host/path to the watchlist-service backend
# (e.g. host: "main.example.com", pathPrefix: "/api/watchlist").