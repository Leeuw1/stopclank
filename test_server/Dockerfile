FROM python:3-alpine
WORKDIR /usr/src/app

# Flask
COPY test_server/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
ENV FLASK_RUN_PORT=3000
EXPOSE 3000

# Sandbox
RUN apk update
RUN apk add gcc make musl-dev linux-headers libseccomp-dev libcap-dev
COPY test_server/main.py ./main.py
COPY test_server/challenges ./challenges
COPY nginx/content/augments.json ./augments.json
COPY test_server/sandbox ./sandbox
RUN (cd sandbox && make install)

CMD ["flask", "--app", "main", "run", "--host=0.0.0.0", "--debug"]
