class FriendshipViewSet(viewsets.ModelViewSet):
    serializer_class = FriendshipSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return (
            Friendship.objects.select_related("requester", "addressee")
            .filter(Q(requester=user) | Q(addressee=user))
            .order_by("-created_at")
        )

    def perform_create(self, serializer: FriendshipSerializer) -> None:
        # Always set requester to current user for security
        serializer.save(requester=self.request.user)

    @action(detail=True, methods=["post"], url_path="accept")
    def accept(self, request, pk=None):
        friendship: Friendship = self.get_object()
        if friendship.addressee_id != request.user.id:
            return Response({"detail": "Only the addressee can accept."}, status=status.HTTP_403_FORBIDDEN)
        friendship.status = FriendshipStatus.ACCEPTED
        friendship.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(friendship).data)

    @action(detail=True, methods=["post"], url_path="decline")
    def decline(self, request, pk=None):
        friendship: Friendship = self.get_object()
        if friendship.addressee_id != request.user.id:
            return Response({"detail": "Only the addressee can decline."}, status=status.HTTP_403_FORBIDDEN)
        friendship.status = FriendshipStatus.DECLINED
        friendship.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(friendship).data)

    @action(detail=True, methods=["post"], url_path="block")
    def block(self, request, pk=None):
        friendship: Friendship = self.get_object()
        # Either party can block
        if request.user.id not in (friendship.requester_id, friendship.addressee_id):
            return Response({"detail": "Not allowed."}, status=status.HTTP_403_FORBIDDEN)
        friendship.status = FriendshipStatus.BLOCKED
        friendship.save(update_fields=["status", "updated_at"])
        return Response(self.get_serializer(friendship).data)
