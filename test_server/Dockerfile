FROM python:3-alpine
WORKDIR /usr/src/app

# Flask
COPY requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
ENV FLASK_RUN_PORT=3000
EXPOSE 3000

# Sandbox
RUN apk update
RUN apk add gcc make musl-dev linux-headers libseccomp-dev libcap-dev
COPY main.py ./main.py
COPY challenges ./challenges
COPY sandbox ./sandbox
RUN (cd sandbox && make install)

COPY entry.sh ./entry.sh

CMD ["./entry.sh"]
