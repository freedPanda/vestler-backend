--
-- PostgreSQL database dump
--

-- Dumped from database version 10.5
-- Dumped by pg_dump version 10.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';

/*
TRANSACTIONS SHOUD BE CHANGED TO INVESTMENTS THAT HAS ID,TYPE,FK TRANSACTIONS_ID
ACCOUNTS SHOULD BE CHANGED TO TRANSACTIONS SHOULD HAVE TYPE(WITHDRAW OR DESPOSIT), 
USERID, FK INVESTMENT ID
*/


SET default_tablespace = '';

SET default_with_oids = false;

CREATE TABLE public.users(
    id serial primary key,
    firstname text,
    lastname text,
    email text,
    username text not null,
    password text not null
);

CREATE TABLE public.images(
    id serial primary key,
    photo bytea,
    user_id int not null references public.users on delete cascade
);

CREATE TABLE public.stocks(
    symbol text primary key,
    name text not null,
    description text,
    currency text not null,
    type text default null,
    image_url text default null,
    exchange text default null,
    website text default null,
    market_cap float default null,
    share_outstanding float default null,
    country text default null
);

CREATE TABLE public.stock_quotes(
    id serial primary key,
    price float,
    q_date TIMESTAMPTZ DEFAULT Now(),
    price_open float,
    high_day float,
    low_day float,
    previous_close float,
    volume integer,
    symbol text not null references public.stocks
);
--keep track of every buy or sell. 
--
CREATE TABLE public.transactions(
    id serial primary key,
    price float not null,
    qty integer not null,
    total float not null,
    symbol text not null references public.stocks,
    user_id integer not null references public.users,
    t_type text not null,
    p_date DATE DEFAULT CURRENT_DATE,
    parent integer DEFAULT NULL,
    market_price float DEFAULT NULL
);

--accounts to keep track of users balance
CREATE TABLE public.accounts(
    id serial primary key,
    balance float DEFAULT 10000,
    user_id integer not null references public.stocks
);

CREATE TABLE public.options(
    id serial primary key,
    user_id integer not null references public.users,
    symbol text not null references public.stocks,
    amount float not null,
    o_type text not null,
    target float not null,
    p_date TIMESTAMPTZ DEFAULT Now(),
    end_date integer not null,
    completed boolean default false,
    result_price float

);

