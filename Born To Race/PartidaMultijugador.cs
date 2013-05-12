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
    class PartidaMultijugador : Partida
    {
        private int ganador = 0; //0 -> Empate, 1 -> J1, 2 -> J2 Ganador de la partida
        private int numJugadores;

        private infoJugador[] jugadores;

        protected CarreraMultijugador[] carreras;

        public PartidaMultijugador(int numJugadores, int numCarreras)
        {
            jugadores = new infoJugador[numJugadores];
            carreras = new CarreraMultijugador[numCarreras];
            this.numJugadores = numJugadores;
            this.numCarreras = numCarreras;
            Coche[] cs = new Coche[numJugadores];
            for (int i = 0; i < numJugadores; i++)
            {
                jugadores[i].coche = new Coche(i);
                cs[i] = jugadores[i].coche;
                jugadores[i].puntos = 0;
            }
            for (int i = 0; i < numCarreras; i++)
                carreras[i] = new CarreraMultijugador(cs,5,i);
        }

        public override void cargarFisicas(GraphicsDeviceManager graphics)
        {
            carreras[carreraActiva].cargarFisicas(graphics);
        }

        public override void leerTeclado(KeyboardState estadoteclado)
        {
            carreras[carreraActiva].leerTeclado(estadoteclado);
            if (estadoteclado.IsKeyDown(Keys.Enter) && estadoPartida == 1)
                finIntermedio = true;
            if (estadoteclado.IsKeyDown(Keys.Enter) && estadoPartida == 2)
                estadoPartida = 3;
            //Debug
            if (estadoteclado.IsKeyDown(Keys.F9))
            {
                estadoPartida = 2;
                ganador = 1;
            }
        }

        public override int principal(SpriteBatch sB, GraphicsDeviceManager graphics) 
        {
            if (estadoPartida == 0) 
            {
                carreras[carreraActiva].principal(sB, graphics);
                if (carreras[carreraActiva].getEstadoCarrera() == 2)
                {
                    estadoPartida = 1;
                    if (carreras[carreraActiva].getGanador() == 1)
                        jugadores[0].puntos++;
                    if (carreras[carreraActiva].getGanador() == 2)
                        jugadores[1].puntos++;
                }
            }
            if (estadoPartida == 1)
            {
                if (carreraActiva < numCarreras - 1)
                {
                    if (finIntermedio)
                    {
                        carreraActiva++;
                        estadoPartida = 0;
                        finIntermedio = false;
                    }
                }
                else
                {
                    if (jugadores[0].puntos > jugadores[1].puntos)
                        ganador = 1;
                    else if (jugadores[0].puntos < jugadores[1].puntos)
                        ganador = 2;
                    estadoPartida = 2;
                }
            }
            return estadoPartida;
        }

        public override void Draw(SpriteBatch sB)
        {
            carreras[carreraActiva].Draw(sB);
            if (estadoPartida == 1)
            {

                sB.Draw(Game1.getTexturaMenuFondo(),new Vector2(210,190),new Rectangle(0,0,600,400),new Color(0, 0, 0,100));
                sB.DrawString(Game1.getFuenteIntermedio(), "Jugador              Puntos", new Vector2(250, 200), Color.White, 0, new Vector2(0, 0), 0.25f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteGanador(), "Jugador 1                    " + jugadores[0].puntos, new Vector2(250, 300), Color.IndianRed, 0, new Vector2(0, 0), 0.4f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteGanador(), "Jugador 2                    " + jugadores[1].puntos, new Vector2(250, 350), Color.IndianRed, 0, new Vector2(0, 0), 0.4f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteIntermedio(), "Pulse ENTER para continuar", new Vector2(250, 540), Color.White, 0, new Vector2(0, 0), 0.18f, SpriteEffects.None, 0);
            }
            if (estadoPartida == 2)
            {
                sB.Draw(Game1.getTexturaMenuFondo(), new Vector2(210, 190), new Rectangle(0, 0, 600, 400), new Color(0, 0, 0, 100));
                if (ganador != 0)
                    sB.DrawString(Game1.getFuenteGanador(), "Jugador " + ganador + " Wins", new Vector2(330, 360), Color.Tomato, 0, new Vector2(0, 0), 0.65f, SpriteEffects.None, 0);
                else
                    sB.DrawString(Game1.getFuenteGanador(), "EMPATE!!", new Vector2(350, 350), Color.Tomato, 0, new Vector2(0, 0), 1f, SpriteEffects.None, 0);
            }
        }

    }
}
