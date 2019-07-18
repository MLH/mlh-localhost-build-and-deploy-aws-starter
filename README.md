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

### Database URL

This allows you to use a custom database url and will be useful for local tests (The app is currently configured to support a custom Postgres or Mysql database). This won't be necessary to deploy the app to AWS, as we will use an RDS instance that Elast Beanstalk configures for us. See the "Adding a database to Your Elastic Beanstalk Environment" section below for more details.

```
CUSTOM_DATABASE_URL=
```

The format should be something like:

```
CUSTOM_DATABASE_URL=mysql://USER:PASSWORD@ENDPOINT/DATABASE_NAME
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

## Deploying to AWS Elastic Beanstalk

We will use [awswebcli](https://pypi.org/project/awsebcli/3.7.4/) to deployr our app to AWS.

### Install awswebcli

```sh
pip install awsebcli
```

### Initialize your APP

After installing `awswebcli`, the first thing we need to do is to initialize our app within AWS.

```sh
eb init
```

This will prompt you with a number of questions to help you configure your environment.

#### Do you wish to continue with CodeCommit?

Select No (N)

#### Default region

As this is an example application, we can choose keep the default option selected.

#### Credentials

Next, it’s going to ask for your AWS credentials.

If needed, you can follow this guide to set up your [IAM account](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_users_create.html)

#### Application name

This will default to the directory name. Just go with that.

#### Python version

Choose any Python 3+ version

#### SSH

Say yes to setting up SSH for your instances.

#### RSA Keypair

Next, you need to generate an RSA keypair, which will be added to your ~/.ssh folder. This keypair will also be uploaded to the EC2 public key for the region you specified in step one. This will allow you to SSH into your EC2 instance later in this tutorial.

### Adding a database to Your Elastic Beanstalk Environment

Open your console management by running

```sh
eb console
```

Then follow [this guide](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/using-features.managing.db.html) to set up your Amazon RDS within your app. The app expects an RDS MySQL database.

### Create an environment

```sh
eb create
```

Just like eb init, this command will prompt you with a series of questions.

#### Environment Name

Name your environment. `localhost-aws-test` for instance.

#### DNS CNAME prefix

This will be your subdomain. You can keep the default value, or use your environment name.

### Configuring Eventbrite Auth Token

Open your console management by running

```sh
eb setenv EVENTBRITE_AUTH_TOKEN={{EVENTBRITE_AUTH_TOKEN_VALUE}}
```

### (Optional) Set up a different DB engine

```sh
eb setenv RDS_ENGINE=postgresql
eb setenv RDS_ENGINE=mysql
```

### Deploy the app

```sh
eb deploy
```
