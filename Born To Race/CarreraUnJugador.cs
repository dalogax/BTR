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
    class CarreraUnJugador : Carrera
    {
        int tiempoCarrera = 20; //Tiempo inicial para dar una vuelta o un conjunto de vueltas
        int bonificacion = 8; //Bonificacion al cumplir el objetivo
        int vueltaActual = 0;
       
        public CarreraUnJugador(Coche[] cs, int idCircuito)
        {
            circuito = new Circuito("Circuito"+idCircuito,idCircuito);
            coches = new cochesInfo[cs.Length];
            coches[0].coche = cs[0];
            coches[0].vuelta = 0;
            coches[0].checkpointActivo = 0;
            coches[0].color = Color.LimeGreen;
            //Propiedades jugador
            coches[0].controles = new Keys[5] {Keys.Up, Keys.Down, Keys.Right, Keys.Left, Keys.M};
            //Inicializacion Timer
            tiempo = new Timer();
            tiempo.Interval = 1000;
            tiempo.Elapsed += new ElapsedEventHandler(tickReloj);
        }

        public override void tickReloj(object source, ElapsedEventArgs e)
        {
            temporizador++;
            if (temporizador >= 1)
                tiempoCarrera--;
        }

        public int getNumVueltas()
        {
            return coches[0].vuelta;
        }

        public override void leerTeclado(KeyboardState estadoteclado)
        {
            Keys[] teclaspulsada = estadoteclado.GetPressedKeys();
            if (estadoCarrera == 1)
            {
                if (estadoteclado.IsKeyUp(coches[0].controles[0]) && estadoteclado.IsKeyUp(coches[0].controles[1]))
                    coches[0].coche.aminorar();
                foreach (Keys ekey in teclaspulsada)
                {
                    if (ekey == coches[0].controles[0])
                        coches[0].coche.acelerar();
                    if (ekey == coches[0].controles[1])
                        coches[0].coche.frenar();
                    if (ekey == coches[0].controles[2])
                        coches[0].coche.girar(1f);
                    if (ekey == coches[0].controles[3])
                        coches[0].coche.girar(-1f);
                    if (ekey == coches[0].controles[4])
                        rescatarCoche(0);
                    //Debug
                    if (ekey == Keys.F8)
                        estadoCarrera = 2;
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

                coches[0].coche.mover((int)circuito.getParrilla(0).X, (int)circuito.getParrilla(0).Y);
                coches[0].coche.setDireccion(circuito.getRescateCk(0).Z);
                
            }

            if (estadoCarrera == 1)
            {
                if (tiempoCarrera <= 0)
                    estadoCarrera = 2;
                if (coches[0].vuelta > vueltaActual && coches[0].vuelta > 1)
                {
                    vueltaActual = coches[0].vuelta;
                    tiempoCarrera += bonificacion;
                }
                controlarChechpoints();            
                coches[0].coche.actualizar(Physics.deteccionSuperficie(graphics, sB, circuito.getNumCircuito(), coches[0].coche));

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
                coches[0].coche.Draw(sB);
                sB.DrawString(Game1.getFuenteMarcador(), tiempoCarrera.ToString(), new Vector2(500, 20), Color.White, 0, new Vector2(0, 0), 0.4f, SpriteEffects.None, 0);
            }
        }
    }
}
