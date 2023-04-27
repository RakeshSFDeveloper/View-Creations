Clone the repository from https://github.com/CongruentInfotechpvtltd/SF-CPQ.git

Create a new branch with the appropriate Task ID

Run 'npm install' in the terminal

After your file changes run 'npm run build' to build the react component as a static resource.

Replace the content of manifest.json in the static resource with the followings

    {

    "landing-pages": [
    {
    "path": "index.html",
    "apex-controller": "YOUR_APEX_CLASS_NAME"
    }
    ]
    }
