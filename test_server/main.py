from flask import Flask, request
import requests
import os
import tempfile
import subprocess
import sys
import string

BAD_REQUEST = ({}, 400)
MAX_CODE_LENGTH = 4096
MAX_FILENAME_LENGTH = 64
BLACKLIST = './'
TIME_LIMIT_SECONDS = 4

def log_error(msg):
    sys.stderr.write('ERROR: ' + msg + '\n')

app = Flask(__name__)

@app.route('/', methods=['POST'])
def test_submission():
    try:
        session_id = request.cookies['session_id'];
    except KeyError:
        log_error('No session_id')
        return BAD_REQUEST
    response = requests.get(f'http://db_api:3000/sessions?session_id=eq.{session_id}', cookies={'session_id': session_id})
    try:
        username = response.json()[0]['username']
    except:
        log_error('Invalid session')
        return BAD_REQUEST
    try:
        code = request.json['code']
    except KeyError:
        log_error('No code')
        return BAD_REQUEST

    if len(code) > MAX_CODE_LENGTH:
        log_error('Code too long')
        return BAD_REQUEST

    try:
        challenge = request.json['challenge']
    except KeyError:
        log_error('No challenge')
        return BAD_REQUEST

    if len(challenge) > MAX_FILENAME_LENGTH:
        log_error('Invalid challenge (filename too long)')
        return BAD_REQUEST
    for c in challenge:
        if c in BLACKLIST or c not in string.printable:
            log_error('Invalid challenge (bad characters)')
            return BAD_REQUEST

    tester_path = f'challenges/{challenge}.py'
    if not os.path.isfile(tester_path):
        log_error('Invalid challenge (test script not found)')
        return BAD_REQUEST

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
        requests.patch(f'http://db_api:3000/users?username=eq.{username}', {challenge: True}, cookies={'session_id': session_id})
        return {'status': 'pass'}
    return {'status': 'fail'}
