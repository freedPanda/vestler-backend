\c 'vestler'
/*DROP TABLE options;
CREATE TABLE public.options(
    id serial primary key,
    user_id integer not null references public.users,
    symbol text not null references public.stocks,
    amount float not null,
    o_type text not null,
    target float not null,
    p_date bigint not null,
    end_date bigint not null,
    completed boolean default false,
    result_price float

);*/

--ALTER TABLE transactions ALTER COLUMN p_date date default CURRENT_DATE;

--ALTER TABLE transactions ADD COLUMN t_date date default CURRENT_DATE;

--ALTER TABLE transactions ADD COLUMN market_price float DEFAULT NULL;

--DELETE FROM transactions;
--ALTER TABLE transactions ADD COLUMN parent integer DEFAULT NULL;

--ALTER TABLE transactions DROP COLUMN holding;

--ALTER TABLE transactions ADD COLUMN p_date TIMESTAMPTZ DEFAULT Now();

UPDATE accounts SET balance=50000 
            WHERE user_id=1;

--DROP TABLE public.accounts;

/*CREATE TABLE public.accounts(
    id serial primary key,
    balance float DEFAULT 10000.00,
    user_id integer not null references public.users
);

INSERT INTO public.accounts (user_id)
values (1);*/



