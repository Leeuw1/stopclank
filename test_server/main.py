from flask import Flask, request
import requests
import os
import tempfile
import subprocess
import sys
import string

MAX_CODE_LENGTH = 4096
MAX_FILENAME_LENGTH = 64
BLACKLIST = './'
TIME_LIMIT_SECONDS = 4

app = Flask(__name__)

@app.route('/', methods=['POST'])
def test_submission():
    try:
        session_id = request.cookies['session_id'];
    except:
        return {'status': 'no_session_id'}
    # TODO: once debugging is done, DO NOT give descriptive error messages for hand-crafted invalid http requests
    try:
        code = request.json['code']
    except KeyError:
        return {'status': 'no_code'}

    if len(code) > MAX_CODE_LENGTH:
        return {'status': 'code_too_long'}

    try:
        challenge = request.json['challenge']
    except KeyError:
        return {'status': 'no_challenge'}

    if len(challenge) > MAX_FILENAME_LENGTH:
        return {'status': 'invalid_challenge (filename too long)'}
    for c in challenge:
        if c in BLACKLIST or c not in string.printable:
            return {'status': 'invalid_challenge (bad characters)'}

    tester_path = f'challenges/{challenge}.py'
    if not os.path.isfile(tester_path):
        return {'status': 'invalid_challenge (tester not found)'}

    with tempfile.TemporaryDirectory() as sandbox_root:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', dir=sandbox_root) as code_file:
            code_file.write(code)
            code_file.flush()
            args = ['sandbox', 'python', tester_path, os.path.basename(code_file.name)]
            try:
                status = subprocess.run(args, timeout=TIME_LIMIT_SECONDS, cwd=sandbox_root).returncode
            except subprocess.TimeoutExpired:
                return {'status': 'time_expired'}

    # TODO: error handling in case request fails
    if status == 0:
        requests.patch('http://db_api:3000/users?username=eq.shaco', {challenge: True}, cookies={'session_id': session_id})
        return {'status': 'pass'}
    return {'status': 'fail'}
