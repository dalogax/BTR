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
    class PartidaUnJugador : Partida
    {
        private infoJugador jugador;
        protected CarreraUnJugador[] carreras;

        public PartidaUnJugador(int numCarreras)
        {
            carreras = new CarreraUnJugador[numCarreras];
            this.numCarreras = numCarreras;
            Coche[] cs = new Coche[1];
            jugador.coche = new Coche(0);
            cs[0] = jugador.coche;
            for (int i = 0; i < numCarreras; i++)
                carreras[i] = new CarreraUnJugador(cs,i);
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
                    if (carreras[carreraActiva].getNumVueltas() > 1) // Para que no sume si no acaba la primera vuelta
                        jugador.puntos += (carreras[carreraActiva].getNumVueltas() - 1) * 10;
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
                    estadoPartida = 2;
            }
            return estadoPartida;
        }

        public override void Draw(SpriteBatch sB)
        {
            carreras[carreraActiva].Draw(sB);
            if (estadoPartida == 1)
            {

                sB.Draw(Game1.getTexturaMenuFondo(),new Vector2(210,190),new Rectangle(0,0,600,400),new Color(0, 0, 0,100));
                sB.DrawString(Game1.getFuenteGanador(), "Puntos                    " + jugador.puntos, new Vector2(250, 300), Color.IndianRed, 0, new Vector2(0, 0), 0.4f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteIntermedio(), "Pulse ENTER para continuar", new Vector2(250, 540), Color.White, 0, new Vector2(0, 0), 0.18f, SpriteEffects.None, 0);
            }
            if (estadoPartida == 2)
            {
                sB.Draw(Game1.getTexturaMenuFondo(), new Vector2(210, 190), new Rectangle(0, 0, 600, 400), new Color(0, 0, 0, 100));
                sB.DrawString(Game1.getFuenteGanador(), "Has conseguido Puntos       " + jugador.puntos, new Vector2(250, 300), Color.IndianRed, 0, new Vector2(0, 0), 0.4f, SpriteEffects.None, 0);
            }
        }
    }
}
