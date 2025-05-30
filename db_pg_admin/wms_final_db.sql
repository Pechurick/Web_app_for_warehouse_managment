PGDMP                      }           wms_db    17.4    17.4 Z    >           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            ?           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false            @           0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            A           1262    16388    wms_db    DATABASE     l   CREATE DATABASE wms_db WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'ru-RU';
    DROP DATABASE wms_db;
                     postgres    false                        3079    16401    system_stats 	   EXTENSION     @   CREATE EXTENSION IF NOT EXISTS system_stats WITH SCHEMA public;
    DROP EXTENSION system_stats;
                        false            B           0    0    EXTENSION system_stats    COMMENT     V   COMMENT ON EXTENSION system_stats IS 'EnterpriseDB system statistics for PostgreSQL';
                             false    2            �            1259    16662    clients    TABLE     �   CREATE TABLE public.clients (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    phone text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    password text NOT NULL
);
    DROP TABLE public.clients;
       public         heap r       postgres    false            �            1259    16661    clients_id_seq    SEQUENCE     �   CREATE SEQUENCE public.clients_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 %   DROP SEQUENCE public.clients_id_seq;
       public               postgres    false    231            C           0    0    clients_id_seq    SEQUENCE OWNED BY     A   ALTER SEQUENCE public.clients_id_seq OWNED BY public.clients.id;
          public               postgres    false    230            �            1259    16690    order_items    TABLE     �   CREATE TABLE public.order_items (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    quantity integer NOT NULL,
    CONSTRAINT order_items_quantity_check CHECK ((quantity > 0))
);
    DROP TABLE public.order_items;
       public         heap r       postgres    false            �            1259    16689    order_items_id_seq    SEQUENCE     �   CREATE SEQUENCE public.order_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 )   DROP SEQUENCE public.order_items_id_seq;
       public               postgres    false    235            D           0    0    order_items_id_seq    SEQUENCE OWNED BY     I   ALTER SEQUENCE public.order_items_id_seq OWNED BY public.order_items.id;
          public               postgres    false    234            �            1259    16674    orders    TABLE     �   CREATE TABLE public.orders (
    id integer NOT NULL,
    client_id integer,
    order_date timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    status text DEFAULT 'pending'::text
);
    DROP TABLE public.orders;
       public         heap r       postgres    false            �            1259    16673    orders_id_seq    SEQUENCE     �   CREATE SEQUENCE public.orders_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 $   DROP SEQUENCE public.orders_id_seq;
       public               postgres    false    233            E           0    0    orders_id_seq    SEQUENCE OWNED BY     ?   ALTER SEQUENCE public.orders_id_seq OWNED BY public.orders.id;
          public               postgres    false    232            �            1259    16638    placed_items    TABLE     0  CREATE TABLE public.placed_items (
    id integer NOT NULL,
    product_id integer NOT NULL,
    quantity integer NOT NULL,
    storage_location_id integer NOT NULL,
    placed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT placed_items_quantity_check CHECK ((quantity > 0))
);
     DROP TABLE public.placed_items;
       public         heap r       postgres    false            �            1259    16637    placed_items_id_seq    SEQUENCE     �   CREATE SEQUENCE public.placed_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 *   DROP SEQUENCE public.placed_items_id_seq;
       public               postgres    false    229            F           0    0    placed_items_id_seq    SEQUENCE OWNED BY     K   ALTER SEQUENCE public.placed_items_id_seq OWNED BY public.placed_items.id;
          public               postgres    false    228            �            1259    16414    product_attributes    TABLE     �   CREATE TABLE public.product_attributes (
    id integer NOT NULL,
    product_id integer,
    attribute_name text NOT NULL,
    attribute_value text NOT NULL
);
 &   DROP TABLE public.product_attributes;
       public         heap r       postgres    false            �            1259    16413    product_attributes_id_seq    SEQUENCE     �   CREATE SEQUENCE public.product_attributes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 0   DROP SEQUENCE public.product_attributes_id_seq;
       public               postgres    false    221            G           0    0    product_attributes_id_seq    SEQUENCE OWNED BY     W   ALTER SEQUENCE public.product_attributes_id_seq OWNED BY public.product_attributes.id;
          public               postgres    false    220            �            1259    16390    products    TABLE     �   CREATE TABLE public.products (
    id integer NOT NULL,
    name text NOT NULL,
    sku text NOT NULL,
    description text,
    category text,
    barcode text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    image_url text
);
    DROP TABLE public.products;
       public         heap r       postgres    false            �            1259    16389    products_id_seq    SEQUENCE     �   CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.products_id_seq;
       public               postgres    false    219            H           0    0    products_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;
          public               postgres    false    218            �            1259    16493    received_items    TABLE     �   CREATE TABLE public.received_items (
    id integer NOT NULL,
    product_id integer,
    quantity integer NOT NULL,
    received_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
 "   DROP TABLE public.received_items;
       public         heap r       postgres    false            �            1259    16492    received_items_id_seq    SEQUENCE     �   CREATE SEQUENCE public.received_items_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 ,   DROP SEQUENCE public.received_items_id_seq;
       public               postgres    false    227            I           0    0    received_items_id_seq    SEQUENCE OWNED BY     O   ALTER SEQUENCE public.received_items_id_seq OWNED BY public.received_items.id;
          public               postgres    false    226            �            1259    16708    shipment_process    TABLE       CREATE TABLE public.shipment_process (
    id integer NOT NULL,
    order_id integer,
    product_id integer,
    storage_location_id integer,
    quantity integer NOT NULL,
    status character varying(20) NOT NULL,
    created_at timestamp without time zone DEFAULT now(),
    CONSTRAINT shipment_process_quantity_check CHECK ((quantity > 0)),
    CONSTRAINT shipment_process_status_check CHECK (((status)::text = ANY ((ARRAY['picked'::character varying, 'checked'::character varying, 'shipped'::character varying])::text[])))
);
 $   DROP TABLE public.shipment_process;
       public         heap r       postgres    false            �            1259    16707    shipment_process_id_seq    SEQUENCE     �   CREATE SEQUENCE public.shipment_process_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 .   DROP SEQUENCE public.shipment_process_id_seq;
       public               postgres    false    237            J           0    0    shipment_process_id_seq    SEQUENCE OWNED BY     S   ALTER SEQUENCE public.shipment_process_id_seq OWNED BY public.shipment_process.id;
          public               postgres    false    236            �            1259    16482    storage_locations    TABLE     �   CREATE TABLE public.storage_locations (
    id integer NOT NULL,
    zone text NOT NULL,
    x integer NOT NULL,
    y integer NOT NULL,
    z integer NOT NULL
);
 %   DROP TABLE public.storage_locations;
       public         heap r       postgres    false            �            1259    16481    storage_locations_id_seq    SEQUENCE     �   CREATE SEQUENCE public.storage_locations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 /   DROP SEQUENCE public.storage_locations_id_seq;
       public               postgres    false    225            K           0    0    storage_locations_id_seq    SEQUENCE OWNED BY     U   ALTER SEQUENCE public.storage_locations_id_seq OWNED BY public.storage_locations.id;
          public               postgres    false    224            �            1259    16468    users    TABLE     c  CREATE TABLE public.users (
    id integer NOT NULL,
    name text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role text DEFAULT 'worker'::text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT users_role_check CHECK ((role = ANY (ARRAY['admin'::text, 'worker'::text, 'manager'::text])))
);
    DROP TABLE public.users;
       public         heap r       postgres    false            �            1259    16467    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    223            L           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    222            d           2604    16665 
   clients id    DEFAULT     h   ALTER TABLE ONLY public.clients ALTER COLUMN id SET DEFAULT nextval('public.clients_id_seq'::regclass);
 9   ALTER TABLE public.clients ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    231    230    231            i           2604    16693    order_items id    DEFAULT     p   ALTER TABLE ONLY public.order_items ALTER COLUMN id SET DEFAULT nextval('public.order_items_id_seq'::regclass);
 =   ALTER TABLE public.order_items ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    234    235    235            f           2604    16677 	   orders id    DEFAULT     f   ALTER TABLE ONLY public.orders ALTER COLUMN id SET DEFAULT nextval('public.orders_id_seq'::regclass);
 8   ALTER TABLE public.orders ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    233    232    233            b           2604    16641    placed_items id    DEFAULT     r   ALTER TABLE ONLY public.placed_items ALTER COLUMN id SET DEFAULT nextval('public.placed_items_id_seq'::regclass);
 >   ALTER TABLE public.placed_items ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    229    228    229            [           2604    16417    product_attributes id    DEFAULT     ~   ALTER TABLE ONLY public.product_attributes ALTER COLUMN id SET DEFAULT nextval('public.product_attributes_id_seq'::regclass);
 D   ALTER TABLE public.product_attributes ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    221    220    221            Y           2604    16393    products id    DEFAULT     j   ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);
 :   ALTER TABLE public.products ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    219    218    219            `           2604    16496    received_items id    DEFAULT     v   ALTER TABLE ONLY public.received_items ALTER COLUMN id SET DEFAULT nextval('public.received_items_id_seq'::regclass);
 @   ALTER TABLE public.received_items ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    226    227    227            j           2604    16711    shipment_process id    DEFAULT     z   ALTER TABLE ONLY public.shipment_process ALTER COLUMN id SET DEFAULT nextval('public.shipment_process_id_seq'::regclass);
 B   ALTER TABLE public.shipment_process ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    236    237    237            _           2604    16485    storage_locations id    DEFAULT     |   ALTER TABLE ONLY public.storage_locations ALTER COLUMN id SET DEFAULT nextval('public.storage_locations_id_seq'::regclass);
 C   ALTER TABLE public.storage_locations ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    224    225    225            \           2604    16471    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    222    223    223            5          0    16662    clients 
   TABLE DATA           O   COPY public.clients (id, name, email, phone, created_at, password) FROM stdin;
    public               postgres    false    231   �n       9          0    16690    order_items 
   TABLE DATA           I   COPY public.order_items (id, order_id, product_id, quantity) FROM stdin;
    public               postgres    false    235   jp       7          0    16674    orders 
   TABLE DATA           C   COPY public.orders (id, client_id, order_date, status) FROM stdin;
    public               postgres    false    233   �p       3          0    16638    placed_items 
   TABLE DATA           `   COPY public.placed_items (id, product_id, quantity, storage_location_id, placed_at) FROM stdin;
    public               postgres    false    229   #q       +          0    16414    product_attributes 
   TABLE DATA           ]   COPY public.product_attributes (id, product_id, attribute_name, attribute_value) FROM stdin;
    public               postgres    false    221   �q       )          0    16390    products 
   TABLE DATA           h   COPY public.products (id, name, sku, description, category, barcode, created_at, image_url) FROM stdin;
    public               postgres    false    219   �q       1          0    16493    received_items 
   TABLE DATA           O   COPY public.received_items (id, product_id, quantity, received_at) FROM stdin;
    public               postgres    false    227   �u       ;          0    16708    shipment_process 
   TABLE DATA           w   COPY public.shipment_process (id, order_id, product_id, storage_location_id, quantity, status, created_at) FROM stdin;
    public               postgres    false    237   3v       /          0    16482    storage_locations 
   TABLE DATA           >   COPY public.storage_locations (id, zone, x, y, z) FROM stdin;
    public               postgres    false    225   �v       -          0    16468    users 
   TABLE DATA           Q   COPY public.users (id, name, email, password_hash, role, created_at) FROM stdin;
    public               postgres    false    223   Hw       M           0    0    clients_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.clients_id_seq', 8, true);
          public               postgres    false    230            N           0    0    order_items_id_seq    SEQUENCE SET     A   SELECT pg_catalog.setval('public.order_items_id_seq', 80, true);
          public               postgres    false    234            O           0    0    orders_id_seq    SEQUENCE SET     <   SELECT pg_catalog.setval('public.orders_id_seq', 18, true);
          public               postgres    false    232            P           0    0    placed_items_id_seq    SEQUENCE SET     B   SELECT pg_catalog.setval('public.placed_items_id_seq', 55, true);
          public               postgres    false    228            Q           0    0    product_attributes_id_seq    SEQUENCE SET     H   SELECT pg_catalog.setval('public.product_attributes_id_seq', 22, true);
          public               postgres    false    220            R           0    0    products_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.products_id_seq', 44, true);
          public               postgres    false    218            S           0    0    received_items_id_seq    SEQUENCE SET     D   SELECT pg_catalog.setval('public.received_items_id_seq', 63, true);
          public               postgres    false    226            T           0    0    shipment_process_id_seq    SEQUENCE SET     F   SELECT pg_catalog.setval('public.shipment_process_id_seq', 53, true);
          public               postgres    false    236            U           0    0    storage_locations_id_seq    SEQUENCE SET     G   SELECT pg_catalog.setval('public.storage_locations_id_seq', 23, true);
          public               postgres    false    224            V           0    0    users_id_seq    SEQUENCE SET     ;   SELECT pg_catalog.setval('public.users_id_seq', 10, true);
          public               postgres    false    222            �           2606    16672    clients clients_email_key 
   CONSTRAINT     U   ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_email_key UNIQUE (email);
 C   ALTER TABLE ONLY public.clients DROP CONSTRAINT clients_email_key;
       public                 postgres    false    231            �           2606    16670    clients clients_pkey 
   CONSTRAINT     R   ALTER TABLE ONLY public.clients
    ADD CONSTRAINT clients_pkey PRIMARY KEY (id);
 >   ALTER TABLE ONLY public.clients DROP CONSTRAINT clients_pkey;
       public                 postgres    false    231            �           2606    16696    order_items order_items_pkey 
   CONSTRAINT     Z   ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_pkey PRIMARY KEY (id);
 F   ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_pkey;
       public                 postgres    false    235            �           2606    16683    orders orders_pkey 
   CONSTRAINT     P   ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_pkey PRIMARY KEY (id);
 <   ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_pkey;
       public                 postgres    false    233            �           2606    16645    placed_items placed_items_pkey 
   CONSTRAINT     \   ALTER TABLE ONLY public.placed_items
    ADD CONSTRAINT placed_items_pkey PRIMARY KEY (id);
 H   ALTER TABLE ONLY public.placed_items DROP CONSTRAINT placed_items_pkey;
       public                 postgres    false    229            v           2606    16421 *   product_attributes product_attributes_pkey 
   CONSTRAINT     h   ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT product_attributes_pkey PRIMARY KEY (id);
 T   ALTER TABLE ONLY public.product_attributes DROP CONSTRAINT product_attributes_pkey;
       public                 postgres    false    221            r           2606    16398    products products_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.products DROP CONSTRAINT products_pkey;
       public                 postgres    false    219            t           2606    16400    products products_sku_key 
   CONSTRAINT     S   ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_sku_key UNIQUE (sku);
 C   ALTER TABLE ONLY public.products DROP CONSTRAINT products_sku_key;
       public                 postgres    false    219            �           2606    16499 "   received_items received_items_pkey 
   CONSTRAINT     `   ALTER TABLE ONLY public.received_items
    ADD CONSTRAINT received_items_pkey PRIMARY KEY (id);
 L   ALTER TABLE ONLY public.received_items DROP CONSTRAINT received_items_pkey;
       public                 postgres    false    227            �           2606    16716 &   shipment_process shipment_process_pkey 
   CONSTRAINT     d   ALTER TABLE ONLY public.shipment_process
    ADD CONSTRAINT shipment_process_pkey PRIMARY KEY (id);
 P   ALTER TABLE ONLY public.shipment_process DROP CONSTRAINT shipment_process_pkey;
       public                 postgres    false    237            |           2606    16489 (   storage_locations storage_locations_pkey 
   CONSTRAINT     f   ALTER TABLE ONLY public.storage_locations
    ADD CONSTRAINT storage_locations_pkey PRIMARY KEY (id);
 R   ALTER TABLE ONLY public.storage_locations DROP CONSTRAINT storage_locations_pkey;
       public                 postgres    false    225            ~           2606    16491 2   storage_locations storage_locations_zone_x_y_z_key 
   CONSTRAINT     v   ALTER TABLE ONLY public.storage_locations
    ADD CONSTRAINT storage_locations_zone_x_y_z_key UNIQUE (zone, x, y, z);
 \   ALTER TABLE ONLY public.storage_locations DROP CONSTRAINT storage_locations_zone_x_y_z_key;
       public                 postgres    false    225    225    225    225            x           2606    16480    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    223            z           2606    16478    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    223            �           2606    16697 %   order_items order_items_order_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
 O   ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_order_id_fkey;
       public               postgres    false    4744    233    235            �           2606    16702 '   order_items order_items_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.order_items
    ADD CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
 Q   ALTER TABLE ONLY public.order_items DROP CONSTRAINT order_items_product_id_fkey;
       public               postgres    false    4722    235    219            �           2606    16684    orders orders_client_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.orders
    ADD CONSTRAINT orders_client_id_fkey FOREIGN KEY (client_id) REFERENCES public.clients(id) ON DELETE CASCADE;
 F   ALTER TABLE ONLY public.orders DROP CONSTRAINT orders_client_id_fkey;
       public               postgres    false    231    4742    233            �           2606    16646 )   placed_items placed_items_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.placed_items
    ADD CONSTRAINT placed_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
 S   ALTER TABLE ONLY public.placed_items DROP CONSTRAINT placed_items_product_id_fkey;
       public               postgres    false    4722    229    219            �           2606    16651 2   placed_items placed_items_storage_location_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.placed_items
    ADD CONSTRAINT placed_items_storage_location_id_fkey FOREIGN KEY (storage_location_id) REFERENCES public.storage_locations(id);
 \   ALTER TABLE ONLY public.placed_items DROP CONSTRAINT placed_items_storage_location_id_fkey;
       public               postgres    false    229    4732    225            �           2606    16422 5   product_attributes product_attributes_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.product_attributes
    ADD CONSTRAINT product_attributes_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE CASCADE;
 _   ALTER TABLE ONLY public.product_attributes DROP CONSTRAINT product_attributes_product_id_fkey;
       public               postgres    false    221    219    4722            �           2606    16500 -   received_items received_items_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.received_items
    ADD CONSTRAINT received_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
 W   ALTER TABLE ONLY public.received_items DROP CONSTRAINT received_items_product_id_fkey;
       public               postgres    false    219    4722    227            �           2606    16717 /   shipment_process shipment_process_order_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.shipment_process
    ADD CONSTRAINT shipment_process_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE CASCADE;
 Y   ALTER TABLE ONLY public.shipment_process DROP CONSTRAINT shipment_process_order_id_fkey;
       public               postgres    false    237    4744    233            �           2606    16722 1   shipment_process shipment_process_product_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.shipment_process
    ADD CONSTRAINT shipment_process_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id);
 [   ALTER TABLE ONLY public.shipment_process DROP CONSTRAINT shipment_process_product_id_fkey;
       public               postgres    false    237    4722    219            �           2606    16727 :   shipment_process shipment_process_storage_location_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.shipment_process
    ADD CONSTRAINT shipment_process_storage_location_id_fkey FOREIGN KEY (storage_location_id) REFERENCES public.storage_locations(id);
 d   ALTER TABLE ONLY public.shipment_process DROP CONSTRAINT shipment_process_storage_location_id_fkey;
       public               postgres    false    237    225    4732            5   �  x�m�Ks�0�5�
��4&�$�
:�R�h�vΆ��Z�(��Pg�3�3I�,�x�/T���B�q�^���̥?�1� 
BHSv��
#�uE�DA�!��?&x�]���.Tϛ.�	��l��K3�fI�N[�Xa�h��擕��u�o�F&Ҽ���w�����۟�c��a�n�uEE*�(��~U�q疉�P��'S��7�)���=B��K�Z�{-�l���DV�::����y���GDՙ�3�T&4�^Tm^EթI�2E�����	�yO���ܵ-�T�~���S�ͺ@�5�9D_�Wv�Q�
��r�� �|�/,<�����3�3�u�n�MT}������������u���/( �K�W|����A����	��qu��f(BHW��uyg��	�ǝ�|�8Q2K�n�+l�Z����ɲ��@      9   G   x�%ͻ�@��*�9㏎^��"{��r��E[-��o9�)�\r�sZ[�!�n��G<�Y�?{/ �2�      7   R   x�m�;
�0�:{
/�������RA���M����$���f��A�:g������}[	��`�V�}��|�A����y�o��      3   �   x�e��BAE�5DaRL����㰿��a
�ˤ2U�"W�]���l�v����f���.ys݊�!�L΢�/�q!=�㜋���/�-������y+XV+q��,�g�a�; �f�\i�,��:����D�	\�?�vH��2~3?�8      +      x������ � �      )   �  x�ŖKoW�דOq7��f�>�DB��T��"��	yX��Ni���@�"�˪R�z�01v_��W������Ӥi+y��s_�����;*��{b����N�>��b���bh��X�b�x�ر=���N�U��g��}FhM�)�0����}�G�{�x(�gǴ�}gs���3��Vb�������o�Oh�S�$�f��ei�HR-R.�ЄQ{�^��A���5W����dA���577S!9/<ho6���3Z������j�o�6�ͮ��zP-�\��N���J�4�� �ʫ�g�����F�4����R*�?Z��^R	p�g�h��E\�PlN���APAs��9<3�s�	��O��U��q~b(���Y,v�W��2!S��DG<��	�)ێ̷k?}ץ<(�E�<h�u��_Q�N�3Ϩ(:c�G��È!dJ���x�-�14�+�������+ƹ�v��X�[�[�J��i�x; �2Yi�x��� �!I�ف�Q�x�������?	������ d�%�=E�xN�v�?��G	��ui��a�CW��������Ts��F�Ep�OYg�֚�v)e!M&R�T�랣3*��z�Dɜ��k̵��_��xJ�`hg�{P� �7$��g�s&����pV�n��8��9��"��v@>�J6�Xv��HU��ƱgSJg��z0����t�V�&�c��YP	 �> ո��tA��s�.��ρXI��e�����P��Y�qC����|R����z��w�r^��S�}�����Ln��V!�*����]�8�<�����k�_T~Ԏ�J���q��i��:����7�\�8:�*�>ʹg_��C9B1��� 
N�Ir�(�9Qq�.�7쓁����
N�����%����5�&Ə�c� ��Uv�����o|u�������]�;����_ {�      1   e   x�m��	A��]E�����SK��#��²����D�B��8��ɝe�(׆D>І�9�%���ѤvH��.���#ʧ�F"Ľ�G�3l�\��T�!r!      ;   �   x���;j0��:E.��Ȳϒ2��[��!�I�^P9�8�io��Ҵ�~�<_����.�޴�bbpIiE�[>��d]��8��L܀�#)�xV# cP���-o��W����ɐ�"v�� �8bo����jZ��h\D�"�f^J�#�(��]
vĞ}
Fؐ �:u�'ӹ΋�02郉��p
      /   =   x�%��  �7cD9� ���:��7�l:d�$,���^T0����;�H-h��J�6f~�l�      -   �  x�m�͎�P�ׇ�p�vN�sDpժ�0#0Tp��@�����դ�n�k�M{M7mg��x��bWm���|�����g�D��7��[:vN��_��N 񫕟8���_;I����4]��rl7�*��EV��r��#eWB.�
)Ce��ڶ��eÔ�y�8��<���X|ŉN����$�>B�n���;��3��/9�F�"#�V�>3�%̫�������ÉӨ����u��&��xID�6���x���<f1ñ���N���gZ��@����oJ�4��p��f��W���^ ������̟�S����G�J��7���� '�/1���$_�S�~��ӻ��:��3�J�\ri���Zh�SG�drWT�
Y��?&��W��g�V>�Xs�L��́��C	�=ļ���=��     