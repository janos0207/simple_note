FROM node:14

ENV DEBUG="notes:*,message:*"
ENV SEQUELIZE_CONNECT="models/sequelize-sqlite.yaml"
ENV NOTES_MODEL="sequelize"
ENV PORT="3000"

RUN mkdir -p /notes/bin /notes/models /notes/partials /notes/public /notes/routes /notes/views
COPY bin/ /notes/bin/
COPY models/ /notes/models/
COPY models/*.mjs models/sequelize-sqlite.yaml /notes/models/
COPY partials/ /notes/partials/
COPY public/ /notes/public/
COPY routes/ /notes/routes/
COPY views/ /notes/views/
COPY app.mjs package.json /notes/

WORKDIR /notes
EXPOSE 3000
CMD node  --experimental-modules ./bin/www.mjs
