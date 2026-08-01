#!/bin/bash

# This script generates .mo binary files from .po translation files
# these .mo files are used by the backend to load translations

flask fab babel-compile --target zobi/translations
