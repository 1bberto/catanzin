# Catanzin (based on Colonizers)

A HTML5 multiplayer game, based on the popular board game ["Catan" (formerly "The Settlers of Catan")](http://en.wikipedia.org/wiki/The_Settlers_of_Catan) by Klaus Teuber.

Works across multiple devices (desktops, tablets, and mobile phones).

![Screenshot](http://i.imgur.com/j91XT2y.png)

## Running locally

Make sure you have the following installed:

- Node.js 8
- MongoDB
- RabbitMQ

```sh
git clone https://github.com/colonizers/colonizers.git

cd catanzin/packages/colonizers/docker

docker-compose up -d

cd ../..

cd catanzin/packages/colonizers-client

npm install

npx npm-force-resolutions

npm install

gulp tilesets

cd ../..

cd /packages/colonizers

npm install

npm start
```

The app should now be running at [http://localhost:5000](http://localhost:5000)

## A work in progress!

Colonizers is very much a work in progress, with several critical gameplay
features still to be implemented. Breaking changes are to be expected, and the database schema may change.

Contributions (both issues and pull requests) are very welcome!
