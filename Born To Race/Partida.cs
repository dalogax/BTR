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
    abstract class Partida
    {
        protected int estadoPartida = 0;//0 -> en Juego, 1 -> Intermedio, 2 -> Fin partida 3 -> Return
        protected struct infoJugador
        {
            public Coche coche;
            public int puntos;
            //public String nombreJugador;
        }
        protected int numCarreras;        
        protected int carreraActiva = 0;
        protected bool finIntermedio = false; //Atributo que detecta si se ha pulsado ENTER para salir del intermedio

        public abstract void leerTeclado(KeyboardState estadoteclado);
        public abstract int principal(SpriteBatch sB, GraphicsDeviceManager graphics);
        public abstract void Draw(SpriteBatch sB);
        public abstract void cargarFisicas(GraphicsDeviceManager graphics);
    }
}
