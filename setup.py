import json
import os
import subprocess

from setuptools import find_packages, setup

BASE_DIR = os.path.abspath(os.path.dirname(__file__))
PACKAGE_JSON = os.path.join(BASE_DIR, "frontend", "package.json")


with open(PACKAGE_JSON) as package_file:
    version_string = json.load(package_file)["version"]


def get_git_sha() -> str:
    try:
        output = subprocess.check_output(["git", "rev-parse", "HEAD"])  # noqa: S603, S607
        return output.decode().strip()
    except Exception:  # pylint: disable=broad-except
        return ""


GIT_SHA = get_git_sha()
version_info = {"GIT_SHA": GIT_SHA, "version": version_string}
print("-==-" * 15)
print("VERSION: " + version_string)
print("GIT SHA: " + GIT_SHA)
print("-==-" * 15)

VERSION_INFO_FILE = os.path.join(BASE_DIR, "zobi", "static", "version_info.json")

with open(VERSION_INFO_FILE, "w") as version_file:
    json.dump(version_info, version_file)

# translating 'no version' from npm to pypi to prevent warning msg
version_string = version_string.replace("-dev", ".dev0")

setup(
    name="zobi",
    version=version_string,
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    entry_points={
        "console_scripts": ["zobi=zobi.cli.main:zobi"],
        # the `postgres` and `postgres+psycopg2://` schemes were removed in SQLAlchemy 1.4  # noqa: E501
        # add an alias here to prevent breaking existing databases
        "sqlalchemy.dialects": [
            "postgres.psycopg2 = sqlalchemy.dialects.postgresql:dialect",
            "postgres = sqlalchemy.dialects.postgresql:dialect",
            "zobi = zobi.extensions.metadb:ZobiAPSWDialect",
        ],
        "shillelagh.adapter": [
            "zobi=zobi.extensions.metadb:ZobiShillelaghAdapter"
        ],
    },
    download_url="https://www.zobi.dev/dist/" + version_string,
)
