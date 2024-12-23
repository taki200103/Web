PGDMP       :                |            postgres    16.6    16.6 (    �           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                      false            �           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                      false            �           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                      false            �           1262    5    postgres    DATABASE     �   CREATE DATABASE postgres WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'English_United States.1252';
    DROP DATABASE postgres;
                postgres    false            �           0    0    DATABASE postgres    COMMENT     N   COMMENT ON DATABASE postgres IS 'default administrative connection database';
                   postgres    false    4852                        3079    16384 	   adminpack 	   EXTENSION     A   CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;
    DROP EXTENSION adminpack;
                   false            �           0    0    EXTENSION adminpack    COMMENT     M   COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';
                        false    2            �            1259    16653    Chat    TABLE     �   CREATE TABLE public."Chat" (
    chat_id character(8) NOT NULL,
    group_id character(4),
    user_id character(8),
    note text NOT NULL,
    chat_date date DEFAULT CURRENT_DATE,
    chat_time time(6) without time zone DEFAULT CURRENT_TIME
);
    DROP TABLE public."Chat";
       public         heap    postgres    false            �            1259    16536    Group    TABLE       CREATE TABLE public."Group" (
    group_id character(4) NOT NULL,
    group_name character varying(100) NOT NULL,
    description character varying(255),
    creation_date date DEFAULT CURRENT_DATE,
    time_created time(6) without time zone DEFAULT LOCALTIME
);
    DROP TABLE public."Group";
       public         heap    postgres    false            �            1259    16541    Group_Member    TABLE       CREATE TABLE public."Group_Member" (
    user_id character(8) NOT NULL,
    group_id character(4) NOT NULL,
    role character varying(30),
    date_join date DEFAULT CURRENT_DATE,
    time_join time(6) without time zone DEFAULT LOCALTIME,
    request character varying(30)
);
 "   DROP TABLE public."Group_Member";
       public         heap    postgres    false            �            1259    16546 
   Group_Task    TABLE     �  CREATE TABLE public."Group_Task" (
    task_id integer NOT NULL,
    group_task_name character varying(100),
    task_description character varying(255),
    status character varying(10),
    group_id character(4),
    user_id character(8),
    creation_date date DEFAULT CURRENT_DATE,
    creation_time time(6) without time zone DEFAULT LOCALTIME,
    date_begin date,
    date_end date,
    time_begin time(6) without time zone,
    time_end time(6) without time zone
);
     DROP TABLE public."Group_Task";
       public         heap    postgres    false            �            1259    16551 	   Task_Type    TABLE     �   CREATE TABLE public."Task_Type" (
    task_type_id integer NOT NULL,
    task_type_name character varying(30) NOT NULL,
    description character varying(255),
    priority integer
);
    DROP TABLE public."Task_Type";
       public         heap    postgres    false            �            1259    16554 	   User_Task    TABLE     �  CREATE TABLE public."User_Task" (
    task_uid character(8) NOT NULL,
    task_uname character varying(255) NOT NULL,
    description character varying(255),
    date_begin date,
    date_end date,
    date_created date DEFAULT CURRENT_DATE,
    start_time time(6) without time zone,
    end_time time(6) without time zone,
    time_created time(6) without time zone DEFAULT LOCALTIME,
    task_type_id integer,
    user_id character(8),
    status character varying(15)
);
    DROP TABLE public."User_Task";
       public         heap    postgres    false            �            1259    16561    Users    TABLE     �   CREATE TABLE public."Users" (
    user_id character(8) NOT NULL,
    user_name character varying(30) NOT NULL,
    email character varying(30),
    password character varying(255)
);
    DROP TABLE public."Users";
       public         heap    postgres    false            �          0    16653    Chat 
   TABLE DATA           X   COPY public."Chat" (chat_id, group_id, user_id, note, chat_date, chat_time) FROM stdin;
    public          postgres    false    222   �4       �          0    16536    Group 
   TABLE DATA           a   COPY public."Group" (group_id, group_name, description, creation_date, time_created) FROM stdin;
    public          postgres    false    216   d5       �          0    16541    Group_Member 
   TABLE DATA           `   COPY public."Group_Member" (user_id, group_id, role, date_join, time_join, request) FROM stdin;
    public          postgres    false    217   �5       �          0    16546 
   Group_Task 
   TABLE DATA           �   COPY public."Group_Task" (task_id, group_task_name, task_description, status, group_id, user_id, creation_date, creation_time, date_begin, date_end, time_begin, time_end) FROM stdin;
    public          postgres    false    218   )6       �          0    16551 	   Task_Type 
   TABLE DATA           Z   COPY public."Task_Type" (task_type_id, task_type_name, description, priority) FROM stdin;
    public          postgres    false    219   F6       �          0    16554 	   User_Task 
   TABLE DATA           �   COPY public."User_Task" (task_uid, task_uname, description, date_begin, date_end, date_created, start_time, end_time, time_created, task_type_id, user_id, status) FROM stdin;
    public          postgres    false    220   �6       �          0    16561    Users 
   TABLE DATA           F   COPY public."Users" (user_id, user_name, email, password) FROM stdin;
    public          postgres    false    221   �7       O           2606    16661    Chat Chat_pkey 
   CONSTRAINT     U   ALTER TABLE ONLY public."Chat"
    ADD CONSTRAINT "Chat_pkey" PRIMARY KEY (chat_id);
 <   ALTER TABLE ONLY public."Chat" DROP CONSTRAINT "Chat_pkey";
       public            postgres    false    222            A           2606    16565    Group_Member Group_Member_pkey 
   CONSTRAINT     o   ALTER TABLE ONLY public."Group_Member"
    ADD CONSTRAINT "Group_Member_pkey" PRIMARY KEY (user_id, group_id);
 L   ALTER TABLE ONLY public."Group_Member" DROP CONSTRAINT "Group_Member_pkey";
       public            postgres    false    217    217            C           2606    16567    Group_Task Group_Task_pkey 
   CONSTRAINT     a   ALTER TABLE ONLY public."Group_Task"
    ADD CONSTRAINT "Group_Task_pkey" PRIMARY KEY (task_id);
 H   ALTER TABLE ONLY public."Group_Task" DROP CONSTRAINT "Group_Task_pkey";
       public            postgres    false    218            =           2606    16569    Group Group_group_name_key 
   CONSTRAINT     _   ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_group_name_key" UNIQUE (group_name);
 H   ALTER TABLE ONLY public."Group" DROP CONSTRAINT "Group_group_name_key";
       public            postgres    false    216            ?           2606    16571    Group Group_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public."Group"
    ADD CONSTRAINT "Group_pkey" PRIMARY KEY (group_id);
 >   ALTER TABLE ONLY public."Group" DROP CONSTRAINT "Group_pkey";
       public            postgres    false    216            E           2606    16573    Task_Type Task_Type_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public."Task_Type"
    ADD CONSTRAINT "Task_Type_pkey" PRIMARY KEY (task_type_id);
 F   ALTER TABLE ONLY public."Task_Type" DROP CONSTRAINT "Task_Type_pkey";
       public            postgres    false    219            G           2606    16575 &   Task_Type Task_Type_task_type_name_key 
   CONSTRAINT     o   ALTER TABLE ONLY public."Task_Type"
    ADD CONSTRAINT "Task_Type_task_type_name_key" UNIQUE (task_type_name);
 T   ALTER TABLE ONLY public."Task_Type" DROP CONSTRAINT "Task_Type_task_type_name_key";
       public            postgres    false    219            I           2606    16577    User_Task User_Task_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public."User_Task"
    ADD CONSTRAINT "User_Task_pkey" PRIMARY KEY (task_uid);
 F   ALTER TABLE ONLY public."User_Task" DROP CONSTRAINT "User_Task_pkey";
       public            postgres    false    220            K           2606    16579    Users Users_pkey 
   CONSTRAINT     W   ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_pkey" PRIMARY KEY (user_id);
 >   ALTER TABLE ONLY public."Users" DROP CONSTRAINT "Users_pkey";
       public            postgres    false    221            M           2606    16581    Users Users_user_name_key 
   CONSTRAINT     ]   ALTER TABLE ONLY public."Users"
    ADD CONSTRAINT "Users_user_name_key" UNIQUE (user_name);
 G   ALTER TABLE ONLY public."Users" DROP CONSTRAINT "Users_user_name_key";
       public            postgres    false    221            V           2606    16662    Chat Chat_group_id_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Chat"
    ADD CONSTRAINT "Chat_group_id_user_id_fkey" FOREIGN KEY (group_id, user_id) REFERENCES public."Group_Member"(group_id, user_id) ON DELETE CASCADE;
 M   ALTER TABLE ONLY public."Chat" DROP CONSTRAINT "Chat_group_id_user_id_fkey";
       public          postgres    false    222    4673    217    217    222            P           2606    16633 '   Group_Member Group_Member_group_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Group_Member"
    ADD CONSTRAINT "Group_Member_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public."Group"(group_id) ON DELETE CASCADE;
 U   ALTER TABLE ONLY public."Group_Member" DROP CONSTRAINT "Group_Member_group_id_fkey";
       public          postgres    false    216    4671    217            Q           2606    16638 &   Group_Member Group_Member_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Group_Member"
    ADD CONSTRAINT "Group_Member_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(user_id) ON DELETE CASCADE;
 T   ALTER TABLE ONLY public."Group_Member" DROP CONSTRAINT "Group_Member_user_id_fkey";
       public          postgres    false    4683    217    221            R           2606    16643 #   Group_Task Group_Task_group_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Group_Task"
    ADD CONSTRAINT "Group_Task_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public."Group"(group_id) ON DELETE CASCADE;
 Q   ALTER TABLE ONLY public."Group_Task" DROP CONSTRAINT "Group_Task_group_id_fkey";
       public          postgres    false    218    4671    216            S           2606    16648 "   Group_Task Group_Task_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."Group_Task"
    ADD CONSTRAINT "Group_Task_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(user_id) ON DELETE CASCADE;
 P   ALTER TABLE ONLY public."Group_Task" DROP CONSTRAINT "Group_Task_user_id_fkey";
       public          postgres    false    218    221    4683            T           2606    16602 %   User_Task User_Task_task_type_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."User_Task"
    ADD CONSTRAINT "User_Task_task_type_id_fkey" FOREIGN KEY (task_type_id) REFERENCES public."Task_Type"(task_type_id);
 S   ALTER TABLE ONLY public."User_Task" DROP CONSTRAINT "User_Task_task_type_id_fkey";
       public          postgres    false    4677    220    219            U           2606    16607     User_Task User_Task_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public."User_Task"
    ADD CONSTRAINT "User_Task_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public."Users"(user_id);
 N   ALTER TABLE ONLY public."User_Task" DROP CONSTRAINT "User_Task_user_id_fkey";
       public          postgres    false    221    4683    220            W           2606    16667    Chat chat_group_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public."Chat"
    ADD CONSTRAINT chat_group_fk FOREIGN KEY (group_id) REFERENCES public."Group"(group_id) ON DELETE CASCADE;
 >   ALTER TABLE ONLY public."Chat" DROP CONSTRAINT chat_group_fk;
       public          postgres    false    222    4671    216            X           2606    16672    Chat chat_user_fk    FK CONSTRAINT     �   ALTER TABLE ONLY public."Chat"
    ADD CONSTRAINT chat_user_fk FOREIGN KEY (user_id) REFERENCES public."Users"(user_id) ON DELETE CASCADE;
 =   ALTER TABLE ONLY public."Chat" DROP CONSTRAINT chat_user_fk;
       public          postgres    false    222    4683    221            �   z   x�e˱�0 �Z�"�'ɲeyl0I����]�wЅￍR\MAcLЇ�NI�nS_�c!љeҪ^�B����ML1���G�3|ߴ�籽.=Q�r�\�9E�k_��)�Q�[@���*#      �   N   x�3166�,I-.Q(�8�*D.��P(�<�*O!9#_!/���\�
N##]C#]#CNc+#+cC=s#cs�=... ���      �   W   x�u�1�  ���ERZ@�[\��Ic����tHSL"s��j�).�
�\�Fd��v�֝ԡ]$�q�l��󖿸{��ӆ�      �      x������ � �      �   �   x�3��x��7Y!�᮵�.�y
Ň&g($ޒ��P��pw{�BXM	X�!��3X2,�S2�ӈˌ�����ߑ�\���䁔�q��t�^PIHX�	�)TOH��y�4�@�rs�g&*�pxM^N=� %�J��b���� �i��      �   �   x�u�I�0E��]Z��5��8 �����"-t��^��+�/!��5(��E'%��iD-�J�KJ�Gሸ�W��k~�pJ-���R�o��h�$$m ˻�������h��0���Qў�s
~��XKÊ�T1�d ��O�Y�9�c��Wx�ϗB?ζ��Jg��*��*V/@��GU�`tT�      �   S  x�m��n�P ��<�k��B�]���(���N��Pd��o�i�9���?�j�J�2�*\�g-oڮ���s�/�H�b6��Hs��8�W�"{��ȑ�r%Z�ƺ��6��0;DZd�N�>Dje���S�4<��_����]�ΐ��iL�"0[(oIm�R�3Q� `'����Q�Ժ�dA��7����9�#N�[�^�&#�1���tmDc�/w�y`� �k�Mh�Y)0���w�2|��W�9N��ˎK���pP��M��G�d��./�@����2f��K�) NU��YV�hʫ��߾mI6���.�U7N��$���Wf�FX������M��!|�� � f���     