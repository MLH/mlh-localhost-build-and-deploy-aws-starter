#!/bin/bash
# setup script for aws env

# check for python
# https://stackoverflow.com/questions/592620/how-to-check-if-a-program-exists-from-a-bash-script?page=1&tab=votes#tab-top
echo "--- Checking for Python3 installation ---"

if ! [ -x "$(command -v python3)" ]; then
  echo 'Error: python3 is not installed. You can install Python3 at https://www.python.org/downloads/'
  exit 1
fi

echo "--- Python3 successfully found! ---"

# check for pip installation
echo "--- Checking for pip installation ---"

if ! [ -x "$(command -v pip)" ]; then
  echo 'Error: pip is not installed. You can install pip at https://pip.pypa.io/en/stable/installing/'
  exit 1
fi

echo "--- Pip successfully found! ---"

# check for pipenv installation
echo "--- Checking for pipenv installation ---"

if ! [ -x "$(command -v pipenv)" ]; then
  echo 'Error: pipenv is not installed. You can install pipenv at https://github.com/pypa/pipenv' >&2
  exit 1
fi

echo "--- Pipenv successfully found! ---"

# check if pipenv dir = project dir
echo "--- Checking if our current directory is equal to pipenv directory ---"

if [ `pipenv --where` != `pwd` ]; then
    PIPENV_LOC=`pipenv --where`
    CURRENT_DIR=`pwd`
    echo "pipenv and project not in same location.
     Pipenv location: ${PIPENV_LOC}. 
     Current dir: ${CURRENT_DIR}."
    exit 1
fi

echo "--- pipenv agrees with pwd directory! ---"

# check for running enviornments
echo "--- Checking for existing virtual enviornments ---"
PIPVENV=`pipenv --venv`
if [[ $PIPVENV != *"No virtualenv has been created for this project yet!"* ]]; then
    echo '--- Found existing virtual env! ---'
    echo "--- Checking env for dependencies. This may take a while... ---"
    FLAG=0
    if [ `pipenv graph | grep -F "mysqlclient==1.4.4"` != "mysqlclient==1.4.4" ]; then
        FLAG=1
        echo '--- Could not find mysqlclient. If you are having trouble installing this package, please refer to the troubleshooting section on the README. ---'
    fi
    if [ `pipenv graph | grep -F "python-dotenv==0.10.1"` != "python-dotenv==0.10.1" ]; then
        FLAG=1
        echo '--- Could not find dotenv ---'
    fi
    if [ `pipenv graph | grep -F "SQLAlchemy==1.3.5"` != "SQLAlchemy==1.3.5" ]; then
        FLAG=1
        echo '--- Could not find SQLAlchemy ---'
    fi
    if [ `pipenv graph | grep -F "psycopg2==2.8.3"` != "psycopg2==2.8.3" ]; then
        FLAG=1
        echo '--- Could not find psycopg2 ---'
    fi
    if [ `pipenv graph | grep -F "Flask==1.0.2"` != "Flask==1.0.2" ]; then
        FLAG=1
        echo '--- Could not find Flask ---'
    fi

    if [ $FLAG == 1 ]; then 
        echo '--- running pip install ---'
        eval `pipenv install -r requirements.txt`
        echo '--- pip install successfully run! Exiting. ---'
        exit 1
    fi

    echo '--- All dependencies successfully found! Exiting. ---'

    exit 1
fi

echo '--- No virtual env found! Installing dependencies now ---'
INSTALL_RESULT=eval `pipenv install -r requirements.txt`

if [[ $INSTALL_RESULT == *"Traceback"* ]]; then
    echo 'Unsuccessful install. Aborting! Ask for help from organizer.'
    exit 1
fi

echo '--- pip install successfully run! Exiting. ---'
exit 0


