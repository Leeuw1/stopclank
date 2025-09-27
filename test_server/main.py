from flask import Flask, request, json
import requests
import os
import tempfile
import subprocess
import sys
import string
import jwt

BAD_REQUEST = ({}, 400)
MAX_CODE_LENGTH = 4096
DEFAULT_POINT_INCREASE = 100
with open('./augments.json', 'r') as file:
    AUGMENTS = json.load(file)
JWT = jwt.encode({'role': 'test_server'}, 'MonoidInTheCategoryOfEndofunctors', algorithm='HS256')

def log_error(msg):
    sys.stderr.write('ERROR: ' + msg + '\n')

app = Flask(__name__)

@app.route('/', methods=['POST'])
def test_submission():
    try:
        session_id = request.cookies['session_id']
        user_id = request.cookies['user_id']
    except KeyError:
        log_error('No session_id')
        return BAD_REQUEST

    # TODO: maybe still check if session_id in sessions table

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

    tester_path = f'challenges/challenge{challenge}.py'
    if not os.path.isfile(tester_path):
        log_error('Invalid challenge (test script not found)')
        return BAD_REQUEST

    with tempfile.TemporaryDirectory() as sandbox_root:
        with tempfile.NamedTemporaryFile(mode='w', suffix='.py', dir=sandbox_root) as code_file:
            code_file.write(code)
            code_file.flush()
            args = ['sandbox', 'python', tester_path, os.path.basename(code_file.name)]
            status = subprocess.run(args, cwd=sandbox_root).returncode

    # TODO: error handling in case request fails
    if status == 0:
        headers = {'Authorization': f'Bearer {JWT}'}
        cookies = {'session_id': session_id}
        user_response = requests.get(f'http://db_api:3000/users?select=augments&id=eq.{user_id}', headers=headers, cookies=cookies)
        user_augments = user_response.json()[0].get('augments', [])

        request_body = {'p_user_id': user_id, 'p_score_increase': calculatePointIncrease(user_augments), 'challenge': challenge}
        requests.post(f'http://db_api:3000/rpc/complete_level', request_body, headers=headers, cookies=cookies)
        return {'status': 'level_complete'}
    if status == 2:
        return {'status': 'time_expired'}
    return {'status': 'fail'}

def calculatePointIncrease(user_augments):
    # start with base points
    base_points = DEFAULT_POINT_INCREASE
    multiplier = 1.0

    for augment in user_augments:
        aug_def = AUGMENTS.get(augment)
        if not aug_def:
            continue  # skip unknown augments

        # Only consider PASSIVE augments for point calculation
        if aug_def["type"] == "PASSIVE_EFFECT":
            if aug_def["effect"] == "MODIFY_BASE_POINTS":
                base_points += aug_def["value"]
            elif aug_def["effect"] == "MODIFY_POINT_MULTIPLIER":
                multiplier += aug_def["value"]

    # apply multiplier last
    total_points = int(base_points * multiplier)
    return total_points
