# Localhost AWS

## Requirements and dependencies

- [Python3](https://www.python.org/)
- [Pip](https://pip.pypa.io/en/latest/installing/) - The python package manager.
- [Flask](http://flask.pocoo.org/) - A simple and flexible Python Web Framework that provides with tools, libraries and technologies to build a web application. (Installed by pip)

## Database requirements

- Locally, install [MariaDB](https://mariadb.org/download/).
- On AWS, MySQL is used and the `mysqlclient` connector is used.

## Clone the project

Use the command below:

```sh
git clone https://github.com/MLH/mlh-localhost-build-and-deploy-aws.git
```

## Set Up Environment variables

To quickly set up environment variables, make a copy of the `.env.example` and rename it to `.env`. Then make sure to modify it following the instructions below.

### Yelp API Key

1. Create a Yelp account
2. Create an app at https://www.yelp.ca/developers/v3/manage_app
3. Copy the API key to the `.env`

```
YELP_AUTH_TOKEN=
```

### Database URL

This allows you to use a [custom database url](https://dev.mysql.com/doc/mysql-getting-started/en/) and will be useful for local tests (The app is currently configured to support a custom Postgres or Mysql database). This won't be necessary to deploy the app to AWS, as we will use an RDS instance that Elastic Beanstalk configures for us. See the "Adding a database to Your Elastic Beanstalk Environment" section below for more details.

```
DATABASE_URL=
```

The format should be something like:

```
DATABASE_URL=mysql://USER:PASSWORD@ENDPOINT/DATABASE_NAME
```

For a local development server, the url could look something like:

```
DATABASE_URL=mysql://littlejohnnydroptables:amaz1ngpa33word@localhost/events
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

We will use [awswebcli](https://pypi.org/project/awsebcli/3.7.4/) to deploy our app to AWS.

### Install awswebcli

```sh
pip install awsebcli
```

### Initialize your APP

After installing `awswebcli`, the first thing we need to do is to initialize our app within AWS.

Initialize your Elastic Beanstalk with:

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

### Configuring YELP Auth Token

Open your console management by running

```sh
eb setenv YELP_AUTH_TOKEN={{YELP_AUTH_TOKEN_VALUE}}
```

### Set up a different DB engine

```sh
eb setenv RDS_ENGINE=mysql
```

### Deploy the app

```sh
eb deploy
```

### Open your app

To see your deployed app in the browser:

```sh
eb open
```
