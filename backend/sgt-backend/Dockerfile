FROM php:8.1.32-cli

RUN apt-get update && apt-get install -y \
    git \
    curl \
    zip \
    unzip \
    libpq-dev \
    libicu-dev \
    && docker-php-ext-install pdo pdo_pgsql intl \
    && apt-get clean

COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

ENV COMPOSER_ALLOW_SUPERUSER=1

RUN composer install --no-dev --optimize-autoloader --ignore-platform-req=ext-intl

RUN rm -f config/development.config.php

RUN mkdir -p data/cache && chmod -R 777 data/cache

EXPOSE 8080

# Al iniciar el contenedor: genera local.php y las llaves desde variables de entorno, luego levanta el servidor
CMD ["sh", "-c", "php scripts/generate-config.php && php -S 0.0.0.0:8080 -t public"]