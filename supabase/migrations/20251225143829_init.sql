create sequence "public"."awards_id_seq";

create sequence "public"."contests_id_seq";

create sequence "public"."notices_id_seq";


  create table "public"."awards" (
    "id" integer not null default nextval('public.awards_id_seq'::regclass),
    "user_id" uuid not null,
    "contest_id" bigint not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."contests" (
    "id" integer not null default nextval('public.contests_id_seq'::regclass),
    "title" text not null,
    "description" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."notices" (
    "id" integer not null default nextval('public.notices_id_seq'::regclass),
    "title" text not null,
    "content" text not null,
    "category" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );



  create table "public"."users" (
    "id" uuid not null,
    "name" text,
    "bio" text,
    "gender" text,
    "college" text,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now()
      );


alter sequence "public"."awards_id_seq" owned by "public"."awards"."id";

alter sequence "public"."contests_id_seq" owned by "public"."contests"."id";

alter sequence "public"."notices_id_seq" owned by "public"."notices"."id";

CREATE UNIQUE INDEX awards_pkey ON public.awards USING btree (id);

CREATE UNIQUE INDEX contests_pkey ON public.contests USING btree (id);

CREATE UNIQUE INDEX notices_pkey ON public.notices USING btree (id);

CREATE UNIQUE INDEX users_pkey ON public.users USING btree (id);

alter table "public"."awards" add constraint "awards_pkey" PRIMARY KEY using index "awards_pkey";

alter table "public"."contests" add constraint "contests_pkey" PRIMARY KEY using index "contests_pkey";

alter table "public"."notices" add constraint "notices_pkey" PRIMARY KEY using index "notices_pkey";

alter table "public"."users" add constraint "users_pkey" PRIMARY KEY using index "users_pkey";

alter table "public"."awards" add constraint "awards_contest_id_fkey" FOREIGN KEY (contest_id) REFERENCES public.contests(id) ON DELETE CASCADE not valid;

alter table "public"."awards" validate constraint "awards_contest_id_fkey";

alter table "public"."awards" add constraint "awards_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE not valid;

alter table "public"."awards" validate constraint "awards_user_id_fkey";

alter table "public"."users" add constraint "users_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE not valid;

alter table "public"."users" validate constraint "users_id_fkey";

grant delete on table "public"."awards" to "anon";

grant insert on table "public"."awards" to "anon";

grant references on table "public"."awards" to "anon";

grant select on table "public"."awards" to "anon";

grant trigger on table "public"."awards" to "anon";

grant truncate on table "public"."awards" to "anon";

grant update on table "public"."awards" to "anon";

grant delete on table "public"."awards" to "authenticated";

grant insert on table "public"."awards" to "authenticated";

grant references on table "public"."awards" to "authenticated";

grant select on table "public"."awards" to "authenticated";

grant trigger on table "public"."awards" to "authenticated";

grant truncate on table "public"."awards" to "authenticated";

grant update on table "public"."awards" to "authenticated";

grant delete on table "public"."awards" to "service_role";

grant insert on table "public"."awards" to "service_role";

grant references on table "public"."awards" to "service_role";

grant select on table "public"."awards" to "service_role";

grant trigger on table "public"."awards" to "service_role";

grant truncate on table "public"."awards" to "service_role";

grant update on table "public"."awards" to "service_role";

grant delete on table "public"."contests" to "anon";

grant insert on table "public"."contests" to "anon";

grant references on table "public"."contests" to "anon";

grant select on table "public"."contests" to "anon";

grant trigger on table "public"."contests" to "anon";

grant truncate on table "public"."contests" to "anon";

grant update on table "public"."contests" to "anon";

grant delete on table "public"."contests" to "authenticated";

grant insert on table "public"."contests" to "authenticated";

grant references on table "public"."contests" to "authenticated";

grant select on table "public"."contests" to "authenticated";

grant trigger on table "public"."contests" to "authenticated";

grant truncate on table "public"."contests" to "authenticated";

grant update on table "public"."contests" to "authenticated";

grant delete on table "public"."contests" to "service_role";

grant insert on table "public"."contests" to "service_role";

grant references on table "public"."contests" to "service_role";

grant select on table "public"."contests" to "service_role";

grant trigger on table "public"."contests" to "service_role";

grant truncate on table "public"."contests" to "service_role";

grant update on table "public"."contests" to "service_role";

grant delete on table "public"."notices" to "anon";

grant insert on table "public"."notices" to "anon";

grant references on table "public"."notices" to "anon";

grant select on table "public"."notices" to "anon";

grant trigger on table "public"."notices" to "anon";

grant truncate on table "public"."notices" to "anon";

grant update on table "public"."notices" to "anon";

grant delete on table "public"."notices" to "authenticated";

grant insert on table "public"."notices" to "authenticated";

grant references on table "public"."notices" to "authenticated";

grant select on table "public"."notices" to "authenticated";

grant trigger on table "public"."notices" to "authenticated";

grant truncate on table "public"."notices" to "authenticated";

grant update on table "public"."notices" to "authenticated";

grant delete on table "public"."notices" to "service_role";

grant insert on table "public"."notices" to "service_role";

grant references on table "public"."notices" to "service_role";

grant select on table "public"."notices" to "service_role";

grant trigger on table "public"."notices" to "service_role";

grant truncate on table "public"."notices" to "service_role";

grant update on table "public"."notices" to "service_role";

grant delete on table "public"."users" to "anon";

grant insert on table "public"."users" to "anon";

grant references on table "public"."users" to "anon";

grant select on table "public"."users" to "anon";

grant trigger on table "public"."users" to "anon";

grant truncate on table "public"."users" to "anon";

grant update on table "public"."users" to "anon";

grant delete on table "public"."users" to "authenticated";

grant insert on table "public"."users" to "authenticated";

grant references on table "public"."users" to "authenticated";

grant select on table "public"."users" to "authenticated";

grant trigger on table "public"."users" to "authenticated";

grant truncate on table "public"."users" to "authenticated";

grant update on table "public"."users" to "authenticated";

grant delete on table "public"."users" to "service_role";

grant insert on table "public"."users" to "service_role";

grant references on table "public"."users" to "service_role";

grant select on table "public"."users" to "service_role";

grant trigger on table "public"."users" to "service_role";

grant truncate on table "public"."users" to "service_role";

grant update on table "public"."users" to "service_role";


