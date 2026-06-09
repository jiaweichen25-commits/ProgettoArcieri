BEGIN;

CREATE TABLE IF NOT EXISTS public."Tutenti"
(
    "IDutente" serial NOT NULL,
    "E-mail" character varying NOT NULL UNIQUE,
    passwd_hash character varying NOT NULL,
    "Ruolo" character varying NOT NULL,
    creato_il timestamp without time zone DEFAULT NOW(),
    PRIMARY KEY ("IDutente")
);

CREATE TABLE IF NOT EXISTS public."Tistruttori"
(
    "IDistruttore" serial NOT NULL,
    "IDutente" integer NOT NULL,
    "Nome" character varying NOT NULL,
    "Cognome" character varying NOT NULL,
    "Qualifica" character varying,
    "Cellulare" character varying,
    "E-mail" character varying,
    PRIMARY KEY ("IDistruttore")
);

COMMENT ON TABLE public."Tistruttori"
    IS 'tabella principale per gli istruttori, nome, cognome, qualifica.';

CREATE TABLE IF NOT EXISTS public."Tatleti"
(
    "IDatleta" serial NOT NULL,
    "IDistruttore" integer NOT NULL,
    "IDutente" integer NOT NULL,
    "Nome" character varying NOT NULL,
    "Cognome" character varying NOT NULL,
    "Indirizzo" character varying,
    "CAP" character varyng,
    "CITTA" character varying,
    "Codice_Fiscale" character varying NOT NULL UNIQUE,
    "Telefono" character varying,
    "Cellulare" character varying,
    "E-mail" character varying,
    "DataNascita" date,
    "Foto" text,
    PRIMARY KEY ("IDatleta")
);

CREATE TABLE IF NOT EXISTS public."Tmateriali"
(
    "IDmateriale" serial NOT NULL,
    "IDatleta" integer NOT NULL,
    "Riser" character varying,
    "LunghezzaRiser" character varying,
    "Flettenti" character varying,
    "LunghezzaFlettenti" character varying,
    "PotenzaNominale" character varying,
    "Rest" character varying,
    "Mirino" character varying,
    "Stabilizzazione" character varying,
    "Aste" character varying,
    "LunghezzaAste" character varying,
    "Punte" character varying,
    "PesoPunte" character varying,
    "Cocche" character varying,
    "Alette" character varying,
    "LunghezzaAlette" character varying,
    "Spine" character varying,
    "Corda" character varying,
    "Fili" integer,
    "Patella" character varying,
    "Bottone" character varying,
    "Molla" character varying,
    "TillerSuperiore" character varying,
    "TillerInferiore" character varying,
    "Brace" character varying,
    "Allungo" character varying,
    "PotenzaReale" character varying,
    "PuntoIncocco" character varying,
    "Data" date NOT NULL,
    "MaterialeCorrente" boolean NOT NULL,
    PRIMARY KEY ("IDmateriale")
);

CREATE TABLE IF NOT EXISTS public."Tallenamenti"
(
    "IDallenamento" serial NOT NULL,
    "IDatleta" integer NOT NULL,
    "DataInizio" date NOT NULL,
    "DataFine" date NOT NULL,
    "Obiettivi" character varying,
    PRIMARY KEY ("IDallenamento")
);

CREATE TABLE IF NOT EXISTS public."TdetAllenamenti"
(
    "IDallenamento" integer NOT NULL,
    "IDsettimana" integer NOT NULL,
    "IDseduta" integer NOT NULL,
    PRIMARY KEY ("IDallenamento", "IDsettimana", "IDseduta")
);

COMMENT ON TABLE public."TdetAllenamenti"
    IS 'Table Dettagli Allenamenti';

CREATE TABLE IF NOT EXISTS public."TdetStretching"
(
    "IDdetStretching" serial NOT NULL,
    "IDallenamento" integer NOT NULL,
    "IDsettimana" integer NOT NULL,
    "IDseduta" integer NOT NULL,
    "Lunedi" character varying,
    "Martedi" character varying,
    "Mercoledi" character varying,
    "Giovedi" character varying,
    "Venerdi" character varying,
    "Sabato" character varying,
    "Domenica" character varying,
    "IDesercizioStretching" integer,
    PRIMARY KEY ("IDdetStretching")
);

CREATE TABLE IF NOT EXISTS public."TSstretching"
(
    "IDesercizioStretching" serial NOT NULL,
    "NomeEsercizio" character varying,
    "Descrizione" text,
    PRIMARY KEY ("IDesercizioStretching")
);

COMMENT ON TABLE public."TSstretching"
    IS 'lookup table for TdetStretching';

CREATE TABLE IF NOT EXISTS public."TdetRiscaldamento"
(
    "IDdetRiscaldamento" serial NOT NULL,
    "IDallenamento" integer NOT NULL,
    "IDsettimana" integer NOT NULL,
    "IDseduta" integer NOT NULL,
    "Lunedi" character varying,
    "Martedi" character varying,
    "Mercoledi" character varying,
    "Giovedi" character varying,
    "Venerdi" character varying,
    "Sabato" character varying,
    "Domenica" character varying,
    "IDesercizioRiscaldamento" integer,
    PRIMARY KEY ("IDdetRiscaldamento")
);

CREATE TABLE IF NOT EXISTS public."TSriscaldamento"
(
    "IDesercizioRiscaldamento" serial NOT NULL,
    "NomeEsercizio" character varying,
    "DescrizioneEsercizio" text,
    PRIMARY KEY ("IDesercizioRiscaldamento")
);

CREATE TABLE IF NOT EXISTS public."TdetTecForCor"
(
    "IDdetTecForCor" serial NOT NULL,
    "IDallenamento" integer NOT NULL,
    "IDsettimana" integer NOT NULL,
    "IDseduta" integer NOT NULL,
    "PosizionePiedi" character varying,
    "Lunedi" character varying,
    "Martedi" character varying,
    "Mercoledi" character varying,
    "Giovedi" character varying,
    "Venerdi" character varying,
    "Sabato" character varying,
    "Domenica" character varying,
    "IDdistanza" integer,
    "IDtarga" integer,
    "IDdescrizioneEsercizio" integer,
    PRIMARY KEY ("IDdetTecForCor")
);

COMMENT ON TABLE public."TdetTecForCor"
    IS 'Tabella dettagli Tecnica-Forza-Coordinazione';

CREATE TABLE IF NOT EXISTS public."TStarga"
(
    "IDtarga" serial NOT NULL,
    "NomeTarga" character varying,
    "Descrizione" text,
    PRIMARY KEY ("IDtarga")
);

CREATE TABLE IF NOT EXISTS public."TSdistanza"
(
    "IDdistanza" serial NOT NULL,
    "NomeEsercizio" character varying,
    "Descrizione" character varying,
    PRIMARY KEY ("IDdistanza")
);

CREATE TABLE IF NOT EXISTS public."TSDescrizioneEsercizio"
(
    "IDdescrizioneEsercizio" serial NOT NULL,
    "NomeEsercizio" character varying,
    "Descrizione" text,
    PRIMARY KEY ("IDdescrizioneEsercizio") 
);

CREATE TABLE IF NOT EXISTS public."TdetAllFisForRes"
(
    "IDdetAllFisForRes" serial NOT NULL,
    "IDallenamento" integer NOT NULL,
    "IDsettimana" integer NOT NULL,
    "IDseduta" integer NOT NULL,
    "Lunedi" character varying,
    "Martedi" character varying,
    "Mercoledi" character varying,
    "Giovedi" character varying,
    "Venerdi" character varying,
    "Sabato" character varying,
    "Domenica" character varying,
    "IDtabella_n" integer,
    "IDdescrizioneEsercizioAllFisForRes" integer,
    PRIMARY KEY ("IDdetAllFisForRes")
);

CREATE TABLE IF NOT EXISTS public."TStabellaNumero"
(
    "IDtabella_n" serial NOT NULL,
    "NumeroTabella" integer,
    PRIMARY KEY ("IDtabella_n")
);

CREATE TABLE IF NOT EXISTS public."TSdescrizioneEsercizioAllFisForRes"
(
    "IDdescrizioneEsercizioAllFisForRes" serial NOT NULL,
    "DescrizioneEsercizio" character varying,
    "Destext" text,
    PRIMARY KEY ("IDdescrizioneEsercizioAllFisForRes")
);

CREATE TABLE IF NOT EXISTS public."TdetAllFisCor"
(
    "IDdetAllFisCor" serial NOT NULL,
    "IDallenamento" integer NOT NULL,
    "IDsettimana" integer NOT NULL,
    "IDseduta" integer NOT NULL,
    "IDatrezzo" integer,
    "Lunedi" character varying,
    "Martedi" character varying,
    "Mercoledi" character varying,
    "Giovedi" character varying,
    "Venerdi" character varying,
    "Sabato" character varying,
    "Domenica" character varying,
    "IDdescrizioneEsercizioAllFisCor" integer,
    PRIMARY KEY ("IDdetAllFisCor")
);

CREATE TABLE IF NOT EXISTS public."TSatrezzi"
(
    "IDatrezzo" serial NOT NULL,
    "AtrezzoDes" character varying,
    PRIMARY KEY ("IDatrezzo")
);

CREATE TABLE IF NOT EXISTS public."TSdesEsercizioAllFisCor"
(
    "IDdescrizioneEsercizioAllFisCor" serial NOT NULL,
    "DescrizioneEsercizio" character varying,
    "EsText" text,
    PRIMARY KEY ("IDdescrizioneEsercizioAllFisCor")
);

CREATE TABLE IF NOT EXISTS public."TdetNoteAtleta"
(
    "IDnota"         serial NOT NULL,
    "IDallenamento"  integer NOT NULL,
    "IDsettimana"    integer NOT NULL,
    "Nota"           text,
    PRIMARY KEY ("IDnota"),
    FOREIGN KEY ("IDallenamento")
        REFERENCES public."Tallenamenti" ("IDallenamento")
        ON UPDATE NO ACTION ON DELETE NO ACTION
);
-- ==========================================
-- VINCOLI E CHIAVI ESTERNE (ALTER TABLES)
-- ==========================================

ALTER TABLE IF EXISTS public."Tistruttori"
    ADD FOREIGN KEY ("IDutente")
    REFERENCES public."Tutenti" ("IDutente") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public."Tatleti"
    ADD FOREIGN KEY ("IDistruttore")
    REFERENCES public."Tistruttori" ("IDistruttore") ON UPDATE NO ACTION ON DELETE NO ACTION,
    ADD FOREIGN KEY ("IDutente")
    REFERENCES public."Tutenti" ("IDutente") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public."Tmateriali"
    ADD FOREIGN KEY ("IDatleta")
    REFERENCES public."Tatleti" ("IDatleta") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public."Tallenamenti"
    ADD FOREIGN KEY ("IDatleta")
    REFERENCES public."Tatleti" ("IDatleta") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public."TdetAllenamenti"
    ADD FOREIGN KEY ("IDallenamento")
    REFERENCES public."Tallenamenti" ("IDallenamento") ON UPDATE NO ACTION ON DELETE NO ACTION;

-- Chiavi composte per le tabelle dei dettagli degli allenamenti
ALTER TABLE IF EXISTS public."TdetStretching"
    ADD FOREIGN KEY ("IDallenamento", "IDsettimana", "IDseduta")
    REFERENCES public."TdetAllenamenti" ("IDallenamento", "IDsettimana", "IDseduta") ON UPDATE NO ACTION ON DELETE NO ACTION,
    ADD FOREIGN KEY ("IDesercizioStretching")
    REFERENCES public."TSstretching" ("IDesercizioStretching") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public."TdetRiscaldamento"
    ADD FOREIGN KEY ("IDallenamento", "IDsettimana", "IDseduta")
    REFERENCES public."TdetAllenamenti" ("IDallenamento", "IDsettimana", "IDseduta") ON UPDATE NO ACTION ON DELETE NO ACTION,
    ADD FOREIGN KEY ("IDesercizioRiscaldamento")
    REFERENCES public."TSriscaldamento" ("IDesercizioRiscaldamento") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public."TdetTecForCor"
    ADD FOREIGN KEY ("IDallenamento", "IDsettimana", "IDseduta")
    REFERENCES public."TdetAllenamenti" ("IDallenamento", "IDsettimana", "IDseduta") ON UPDATE NO ACTION ON DELETE NO ACTION,
    ADD FOREIGN KEY ("IDdistanza")
    REFERENCES public."TSdistanza" ("IDdistanza") ON UPDATE NO ACTION ON DELETE NO ACTION,
    ADD FOREIGN KEY ("IDtarga")
    REFERENCES public."TStarga" ("IDtarga") ON UPDATE NO ACTION ON DELETE NO ACTION,
    ADD FOREIGN KEY ("IDdescrizioneEsercizio")
    REFERENCES public."TSDescrizioneEsercizio" ("IDdescrizioneEsercizio") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public."TdetAllFisForRes"
    ADD FOREIGN KEY ("IDallenamento", "IDsettimana", "IDseduta")
    REFERENCES public."TdetAllenamenti" ("IDallenamento", "IDsettimana", "IDseduta") ON UPDATE NO ACTION ON DELETE NO ACTION,
    ADD FOREIGN KEY ("IDtabella_n")
    REFERENCES public."TStabellaNumero" ("IDtabella_n") ON UPDATE NO ACTION ON DELETE NO ACTION,
    ADD FOREIGN KEY ("IDdescrizioneEsercizioAllFisForRes")
    REFERENCES public."TSdescrizioneEsercizioAllFisForRes" ("IDdescrizioneEsercizioAllFisForRes") ON UPDATE NO ACTION ON DELETE NO ACTION;

ALTER TABLE IF EXISTS public."TdetAllFisCor"
    ADD FOREIGN KEY ("IDallenamento", "IDsettimana", "IDseduta")
    REFERENCES public."TdetAllenamenti" ("IDallenamento", "IDsettimana", "IDseduta") ON UPDATE NO ACTION ON DELETE NO ACTION,
    ADD FOREIGN KEY ("IDatrezzo")
    REFERENCES public."TSatrezzi" ("IDatrezzo") ON UPDATE NO ACTION ON DELETE NO ACTION,
    ADD FOREIGN KEY ("IDdescrizioneEsercizioAllFisCor")
    REFERENCES public."TSdesEsercizioAllFisCor" ("IDdescrizioneEsercizioAllFisCor") ON UPDATE NO ACTION ON DELETE NO ACTION;

COMMIT;