# Localhost AWS

## Requirements and dependencies

- [Python3](https://www.python.org/) - We recommend using virtual environments. They will help on the creation of isolated environments so different python versions can run on the same machine. Check more about virtual environments [here](https://docs.python.org/3/library/venv.html). (Needs to be installed manually)
- [Pip](https://pip.pypa.io/en/latest/installing/) - The python package manager. (Needs to be installed manually)
- [Flask](http://flask.pocoo.org/) - A simple and flexible Python Web Framework that provides with tools, libraries and technologies to build a web application. (Installed by pip)

## Clone the project

Use the command below:

```sh
git clone https://github.com/MLH/mlh-localhost-build-and-deploy-aws.git
```

## Set Up Environment variables

To quickly set up environment variables, make a copy of the `.env.example` and rename it to `.env`. Then make sure to modify it following the instructions below.

### EventBrite API Key

We need to setup an Eventbrite Auth token to be able to fetch data from Eventbrite's API. Follow [this guide](https://www.eventbrite.com/platform/api#/introduction/authentication) to get your key. The **Personal Tokens** section is the relevant bit.

After going through the tutorial, you should have the following information:

```
EVENTBRITE_AUTH_TOKEN=
```

### Postgres Database URL

For this example app, we will be using a Postgresql database. We need to specify Postgre's database url in the config. Follow [this guide](https://aws.amazon.com/getting-started/tutorials/create-connect-postgresql-db) to get your database set up.

After going through the tutorial, you should have the following information:

```
DATABASE_URL=
```

The format should be something like:

```
DATABASE_URL=postgresql://USER:PASSWORD@ENDPOINT/DATABASE_NAME
```

## Install dependencies

The next step is to install the dependencies used by the project. Run the following command:

```sh
pip install -r requirements.txt
```

## Executing the application

After having all the dependencies installed, you only need to execute the main application file. In this case it will be the file "main.py"

```
FLASK_APP=application.py FLASK_DEBUG=1 flask run
```

Then open [http://localhost:5000/](http://localhost:5000/) to see the application.
