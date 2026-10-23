# PeersWatch
Enjoy your favorite movies with a friend: we will take care of keeping your video players synced. 

## Details
The two peers enstablish a WebRTC peer-to-peer connection and use the direct channel to keep the video players synced. To enstablish a connection peers are required to share an "offer" and an "answer" string via a different comunication channel. Both peers are required to have a local copy of the video file and the app does no video streaming. The bandwidth used is almost zero.
