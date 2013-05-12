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
    class CarreraMultijugador : Carrera
    {
        private int ganador = 0; //1 -> J1, 2 -> J2 Ganador de una carrera
        private int numVueltas;

        public CarreraMultijugador(Coche[] cs, int numVueltas, int idCircuito)
        {
            this.numVueltas = numVueltas;
            circuito = new Circuito("Circuito"+idCircuito,idCircuito);
            coches = new cochesInfo[cs.Length];
            for (int i = 0; i < cs.Length; i++)
            {
                coches[i].coche = cs[i];
                coches[i].vuelta = 0;
                coches[i].checkpointActivo = 0;
            }
            //Propiedades jugador (despues bucle)
            coches[0].color = Color.LimeGreen;
            coches[1].color = Color.Red;
            coches[0].controles = new Keys[5] { Keys.Up, Keys.Down, Keys.Right, Keys.Left, Keys.M };
            coches[1].controles = new Keys[5] { Keys.W, Keys.S, Keys.D, Keys.A, Keys.R };
            //Inicializacion timer
            tiempo = new Timer();
            tiempo.Interval = 1000;
            tiempo.Elapsed += new ElapsedEventHandler(tickReloj);
        }

        public int getGanador()
        {
            return ganador;
        }

        public override void tickReloj(object source, ElapsedEventArgs e)
        {
            temporizador++;
        }

        public override void leerTeclado(KeyboardState estadoteclado)
        {
            Keys[] teclaspulsada = estadoteclado.GetPressedKeys();
            if (estadoCarrera == 1)
            {
                for (int i = 0; i < coches.Length; i++)
                {
                    if (estadoteclado.IsKeyUp(coches[i].controles[0]) && estadoteclado.IsKeyUp(coches[i].controles[1]))
                        coches[i].coche.aminorar();
                }

                foreach (Keys ekey in teclaspulsada)
                {
                    for (int i = 0; i < coches.Length; i++)
                    {
                        if (ekey == coches[i].controles[0])
                            coches[i].coche.acelerar();
                        if (ekey == coches[i].controles[1])
                            coches[i].coche.frenar();
                        if (ekey == coches[i].controles[2])
                            coches[i].coche.girar(1f);
                        if (ekey == coches[i].controles[3])
                            coches[i].coche.girar(-1f);
                        if (ekey == coches[i].controles[4])
                            rescatarCoche(i);
                    }
                    //Debug
                    if (ekey == Keys.F8)
                    {
                        ganador = 1;
                        estadoCarrera = 2;
                    }
                }
            }
        }

        public override void principal(SpriteBatch sB, GraphicsDeviceManager graphics)
        {
            //Console.WriteLine(temporizador);
            if (estadoCarrera == 0)
            {
                if (temporizador == -5)
                    tiempo.Start();
                if (temporizador == 0)
                    estadoCarrera = 1;
                for (int i = 0; i < coches.Length; i++)
                {
                    coches[i].coche.mover((int)circuito.getParrilla(i).X, (int)circuito.getParrilla(i).Y);
                    coches[i].coche.setDireccion(circuito.getRescateCk(0).Z);
                }
            }

            if (estadoCarrera == 1)
            {
                controlarChechpoints();
                for (int i = 0; i < coches.Length; i++)              
                    coches[i].coche.actualizar(Physics.deteccionSuperficie(graphics, sB, circuito.getNumCircuito(), coches[i].coche));

                //Console.WriteLine("C1 X: " + coches[0].coche.getPosicion().X + " Y: " + coches[0].coche.getPosicion().Y);
                //Console.WriteLine("C2 X: " + coches[1].coche.getPosicion().X + " Y: " + coches[1].coche.getPosicion().Y);

                for (int i = 0; i < coches.Length; i++)
                {
                    if (coches[i].vuelta == numVueltas + 1)
                    {
                        ganador = i+1;
                        estadoCarrera = 2;
                    }
                }
            }
        }

        public override void Draw(SpriteBatch sB)
        {
            circuito.Draw(sB);
            if (estadoCarrera == 0)
            {
                if (temporizador == -4)
                    sB.Draw(Game1.getTexturaSemaforo(0), circuito.getPosSemaforo(), null, Color.White, 0, Vector2.Zero, new Vector2(0.02f, 0.02f), SpriteEffects.None, 0);
                if (temporizador == -3)
                    sB.Draw(Game1.getTexturaSemaforo(1), circuito.getPosSemaforo(), null, Color.White, 0, Vector2.Zero, new Vector2(0.02f, 0.02f), SpriteEffects.None, 0);
                if (temporizador == -2)
                    sB.Draw(Game1.getTexturaSemaforo(2), circuito.getPosSemaforo(), null, Color.White, 0, Vector2.Zero, new Vector2(0.02f, 0.02f), SpriteEffects.None, 0);
                if (temporizador == -1)
                    sB.Draw(Game1.getTexturaSemaforo(3), circuito.getPosSemaforo(), null, Color.White, 0, Vector2.Zero, new Vector2(0.02f, 0.02f), SpriteEffects.None, 0);
                if (temporizador == 0)
                    sB.Draw(Game1.getTexturaSemaforo(4), circuito.getPosSemaforo(), null, Color.White, 0, Vector2.Zero, new Vector2(0.02f, 0.02f), SpriteEffects.None, 0);
            } 
            if (estadoCarrera == 0 || estadoCarrera == 1)
            {
                for (int i = 0; i < coches.Length; i++)
                    coches[i].coche.Draw(sB);
                for (int i = 0; i < coches.Length; i++)
                    sB.DrawString(Game1.getFuenteMarcador(), coches[i].vuelta + " / " + numVueltas, new Vector2(20 + (i*140), 20), coches[i].color, 0, new Vector2(0, 0), 0.4f, SpriteEffects.None, 0);
            }
        }
    }
}