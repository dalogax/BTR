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
    class Menu
    {
        private static int mActivo = 0; // 0 -> Un jugador, 1 -> Multijugador, 2 -> Opciones, 3 -> Salir

        private static int esTeclaAbajoPulsada = 1;
        private static int esTeclaArribaPulsada = 1;
        private static int esEnterPulsado = 1;

        public static int leerTeclado(KeyboardState estadoteclado)
        {
            Keys[] teclaspulsada = estadoteclado.GetPressedKeys();

            if (estadoteclado.IsKeyUp(Keys.Up))
                esTeclaArribaPulsada = 0;
            if (estadoteclado.IsKeyUp(Keys.Down))
                esTeclaAbajoPulsada = 0;
            if (estadoteclado.IsKeyUp(Keys.Enter))
                esEnterPulsado = 0;

            foreach (Keys ekey in teclaspulsada)
            {
                if (ekey == Keys.Up && esTeclaArribaPulsada == 0)
                {
                    if (mActivo != 0)
                        mActivo--;
                    esTeclaArribaPulsada = 1;

                }
                if (ekey == Keys.Down && esTeclaAbajoPulsada == 0)
                {
                    if (mActivo != 3)
                        mActivo++;
                    esTeclaAbajoPulsada = 1;
                }
                if (ekey == Keys.Enter && esEnterPulsado == 0)
                {
                    esEnterPulsado = 1;
                    return mActivo;
                }
            }
            return -1;
        }

        public static void Draw (SpriteBatch sB) 
        {
            sB.Draw(Game1.getTexturaMenuFondo(), Vector2.Zero, null, Color.White, 0, Vector2.Zero, 1, SpriteEffects.None, 0);
            if (mActivo == 0)
            {
                sB.DrawString(Game1.getFuenteMenu(), "UN JUGADOR", new Vector2(520, 340), Color.CornflowerBlue, 0, new Vector2(0, 0), 0.8f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "MULTIJUGADOR", new Vector2(570, 445), Color.White, 0, new Vector2(0, 0), 0.55f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "OPCIONES", new Vector2(640, 550), Color.White, 0, new Vector2(0, 0), 0.55f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "SALIR", new Vector2(690, 650), Color.White, 0, new Vector2(0, 0), 0.55f, SpriteEffects.None, 0);
            }
            if (mActivo == 1)
            {
                sB.DrawString(Game1.getFuenteMenu(), "UN JUGADOR", new Vector2(600, 340), Color.White, 0, new Vector2(0, 0), 0.55f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "MULTIJUGADOR", new Vector2(510, 440), Color.CornflowerBlue, 0, new Vector2(0, 0), 0.7f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "OPCIONES", new Vector2(640, 550), Color.White, 0, new Vector2(0, 0), 0.55f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "SALIR", new Vector2(690, 650), Color.White, 0, new Vector2(0, 0), 0.55f, SpriteEffects.None, 0);
            }
            if (mActivo == 2)
            {
                sB.DrawString(Game1.getFuenteMenu(), "UN JUGADOR", new Vector2(600, 340), Color.White, 0, new Vector2(0, 0), 0.55f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "MULTIJUGADOR", new Vector2(570, 445), Color.White, 0, new Vector2(0, 0), 0.55f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "OPCIONES", new Vector2(580, 530), Color.CornflowerBlue, 0, new Vector2(0, 0), 0.8f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "SALIR", new Vector2(690, 650), Color.White, 0, new Vector2(0, 0), 0.55f, SpriteEffects.None, 0);
            }
            if (mActivo == 3)
            {
                sB.DrawString(Game1.getFuenteMenu(), "UN JUGADOR", new Vector2(600, 340), Color.White, 0, new Vector2(0, 0), 0.55f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "MULTIJUGADOR", new Vector2(570, 445), Color.White, 0, new Vector2(0, 0), 0.55f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "OPCIONES", new Vector2(640, 550), Color.White, 0, new Vector2(0, 0), 0.55f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "SALIR", new Vector2(660, 630), Color.CornflowerBlue, 0, new Vector2(0, 0), 0.8f, SpriteEffects.None, 0);
            }
        }
    }
}
