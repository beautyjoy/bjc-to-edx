#! /usr/bin/env python3

import os.path

PREFIX = "/bjc-r/"

def edx_image_location(src):
    src = src.replace(PREFIX, "")
    src = convert_image_path(src)
    slash = "/" if src[0] != "/" else ""
    return "/static" + slash + src

def convert_image_path(src):
    return os.path.normpath(src).replace("/", "_")
    
