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
using System.Timers;

namespace Born_To_Race
{
    abstract class Carrera
    {
        protected Circuito circuito;
        protected int temporizador = -5;
        protected int estadoCarrera = 0;//0 -> Parrilla, 1 -> Carrera, 2 -> Fin carrera

        protected Timer tiempo;

        protected struct cochesInfo
        {
            public Coche coche;
            public int vuelta;
            public int checkpointActivo;
            public Color color;
            public Keys[] controles;
        }

        protected cochesInfo[] coches;

        public abstract void leerTeclado(KeyboardState estadoteclado);
        public abstract void principal(SpriteBatch sB, GraphicsDeviceManager graphics);
        public abstract void Draw(SpriteBatch sB);
        public abstract void tickReloj(object source, ElapsedEventArgs e);

        public int getEstadoCarrera()
        {
            return estadoCarrera;
        }

        protected void rescatarCoche(int i)
        {
            int ckAnterior = 0;
            if (coches[i].checkpointActivo == 0)
            {
                if (coches[i].vuelta != 0)
                    ckAnterior = circuito.getNumCk() - 1;
                else
                    return;
            }
            else
                ckAnterior = coches[i].checkpointActivo - 1;
            coches[i].coche.mover((int)circuito.getRescateCk(ckAnterior).X, (int)circuito.getRescateCk(ckAnterior).Y);
            coches[i].coche.setDireccion(circuito.getRescateCk(ckAnterior).Z);
        }

        protected void controlarChechpoints()
        {
            for (int i = 0; i < coches.Length; i++)
            {
                if (circuito.getBBox(coches[i].checkpointActivo).Intersects(coches[i].coche.getBBox()))
                {
                    if (coches[i].checkpointActivo == 0)
                        coches[i].vuelta++;
                    if (coches[i].checkpointActivo == circuito.getNumCk() - 1)
                        coches[i].checkpointActivo = 0;
                    else
                        coches[i].checkpointActivo++;
                }
            }
        }

        public void cargarFisicas(GraphicsDeviceManager graphics)
        {
            for (int i = 0; i < coches.Length; i++)
                Physics.loadPhysics(graphics, coches[i].coche);
        }
    }
}
