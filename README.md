*This project is still in development mode,i still have ideas and i am adding more features to it, but i think it already has a decent amount of features and the most functionality is already here.

It's a project that i wanted to build long time ago, mainly because it implies using a lot of my skills and wanted to sharpen my skills with websockets (Socket.io).
The concept of the app is easy to understand as the repository name implies this is an app where people can chat.
**But** it gets more interesting than that, in short in the app you are able to:

-Register an user account where you set you're username and password, adiotionally you can set a profile image\
-As user you can later change you're username max 3 times and can change you're password and profile image unlimited times\
-You can create or join rooms (which are groups where people can join and chat)\
-When creating a room you must provide a room_name and a room password room_name must be unique, and a room image optionally\
-If you want to join the room you will have to provide the right room_name and password\
-After creating/joining a room you get directed to /chat/?id and you get to see the chat interface\
-In the chat you can write messages, upload images and videos, switch between all the rooms you are member of and you're able to upload an image / video with text in the same message
-You have search bar where you can get to any message back by typing letters that were apart of that message\ 
-Also there is a pannel where you can see all the members of them room + see live if they are online or offline\
-Latest person of room that is typing you will see an animation of him typing live\
-There is an upload limit of 5MB per image and 20MB for a video currently\
-Images and videos are compressed

**Technologies used:**

**TypeScript**\
Front -> React
Back -> Express, MongoDb, Socket.io, Docker to containerize the application and as production deployement i used AWS

Currently i host the app on AWS and currently you can visit the app at http://54.146.58.54:3000/register

*In case i will restart the machine the ip will change cause is dinamic allocated currently so you might want to look in this README for changes to the url if that happens : )