#!/usr/bin/env bash


# Use this to sign the tar balls generated from
# python setup.py sdist --formats=gztar
# ie. sign.sh <my_tar_ball>
# you will still be required to type in your signing key password
# or it needs to be available in your keychain


# The name of the file/artifact to sign ${RELEASE}-source.tar.gz

if [ -z "${1}" ]; then
    echo "Missing first parameter, usage: sign <FILE_NAME> <GPG KEY>"
    exit 1
fi
NAME="${1}"
if [ -z "${2}" ]; then
  gpg --armor --output "${NAME}".asc --detach-sig "${NAME}"
else
  # The GPG key name to use
  GPG_LOCAL_USER="${2}"
  gpg --local-user "${GPG_LOCAL_USER}" --armor --output "${NAME}".asc --detach-sig "${NAME}"
fi
shasum -a 512 "${NAME}" > "${NAME}.sha512"
