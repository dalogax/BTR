using System;
using System.Collections.Generic;
using Microsoft.Xna.Framework;
using Microsoft.Xna.Framework.Audio;
using Microsoft.Xna.Framework.Content;
using Microsoft.Xna.Framework.GamerServices;
using Microsoft.Xna.Framework.Graphics;
using Microsoft.Xna.Framework.Input;
using Microsoft.Xna.Framework.Media;
using Microsoft.Xna.Framework.Net;
using Microsoft.Xna.Framework.Storage;


namespace Born_To_Race
{
    class Circuito
    {
        private int numCheckpoints;
        private BoundingBox[] checkPoints;
        private Vector3[] rescateCk;
        private Vector2 posSemaforo;
        private Vector2[] parrilla;
        private int numCircuito;

        public Circuito(string nombre, int n)
        {
            numCircuito = n;
            //Leer fichero txt de circuito
            string texto;

            System.IO.StreamReader sr = new System.IO.StreamReader("Content/DatosCircuitos/" + nombre + ".txt");

            string [] textoDiv;
            float direccion = 0;
            //Parrilla
            parrilla = new Vector2[4];
            texto = sr.ReadLine();
            textoDiv = texto.Split(' ');
            parrilla[0] = new Vector2(int.Parse(textoDiv[0]), int.Parse(textoDiv[1]));
            texto = sr.ReadLine();
            textoDiv = texto.Split(' ');
            parrilla[1] = new Vector2(int.Parse(textoDiv[0]), int.Parse(textoDiv[1]));
            texto = sr.ReadLine();
            textoDiv = texto.Split(' ');
            parrilla[2] = new Vector2(int.Parse(textoDiv[0]), int.Parse(textoDiv[1]));
            texto = sr.ReadLine();
            textoDiv = texto.Split(' ');
            parrilla[3] = new Vector2(int.Parse(textoDiv[0]), int.Parse(textoDiv[1]));
            //Semaforo
            texto = sr.ReadLine();
            textoDiv = texto.Split(' ');
            posSemaforo = new Vector2(int.Parse(textoDiv[0]), int.Parse(textoDiv[1]));
            //Checkpoints
            texto = sr.ReadLine();
            numCheckpoints = int.Parse(texto);
            checkPoints = new BoundingBox[numCheckpoints];
            rescateCk = new Vector3[numCheckpoints];
            for (int i = 0; i < numCheckpoints; i++)
            {
                texto = sr.ReadLine();
                textoDiv = texto.Split(' ');
                checkPoints[i] = new BoundingBox(new Vector3(int.Parse(textoDiv[0]),int.Parse(textoDiv[1]), 0), new Vector3(int.Parse(textoDiv[2]),int.Parse(textoDiv[3]), 0));
                texto = sr.ReadLine();
                textoDiv = texto.Split(' ');
                if (textoDiv[2].CompareTo("izq") == 0)
                    direccion = (float)Math.PI;
                if (textoDiv[2].CompareTo("abaj") == 0)
                    direccion = (float)Math.PI / 2;
                if (textoDiv[2].CompareTo("arrib") == 0)
                    direccion = -(float)Math.PI / 2;
                if (textoDiv[2].CompareTo("der") == 0)
                    direccion = 0;
                rescateCk[i] = new Vector3(int.Parse(textoDiv[0]), int.Parse(textoDiv[1]), direccion);
            }
            sr.Close();
        }

        public int getNumCircuito()
        {
            return numCircuito;
        }

        public BoundingBox getBBox(int b)
        {
            return checkPoints[b];
        }

        public Vector3 getRescateCk(int r)
        {
            return rescateCk[r];
        }

        public int getNumCk()
        {
            return numCheckpoints;
        }

        public Vector2 getPosSemaforo() 
        {
            return posSemaforo; 
        }

        public Vector2 getParrilla(int i)
        {
            return parrilla[i];
        }

        public void Draw(SpriteBatch sB)
        {
            sB.Draw(Game1.getTexturaColisiones(numCircuito), Vector2.Zero, Color.White);
            sB.Draw(Game1.getTexturaCircuito(numCircuito), Vector2.Zero, Color.White);
        }
    }
}