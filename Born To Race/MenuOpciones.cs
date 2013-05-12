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
    class MenuOpciones
    {
        private static int mActivo = 0; // 0 ->Volver menu, 1 -> Aplicar cambios, 2 -> Activar/desactivar FullScreen

        private static int esTeclaAbajoPulsada = 1;
        private static int esTeclaArribaPulsada = 1;
        private static int esEnterPulsado = 1;
        private static bool isFullScreen = false;
        private static int esTeclaIzquierdaPulsada = 1;
        private static int esTeclaDerechaPulsada = 1;

        public static bool getFullScreen()
        {
            return isFullScreen;
        }

        public static void resetMenu(bool fs)
        {
            mActivo = 0;
            isFullScreen = fs;
        }

        public static int leerTeclado(KeyboardState estadoteclado)
        {
            Keys[] teclaspulsada = estadoteclado.GetPressedKeys();

            if (estadoteclado.IsKeyUp(Keys.Up))
                esTeclaArribaPulsada = 0;
            if (estadoteclado.IsKeyUp(Keys.Down))
                esTeclaAbajoPulsada = 0;
            if (estadoteclado.IsKeyUp(Keys.Enter))
                esEnterPulsado = 0;
            if (estadoteclado.IsKeyUp(Keys.Left))
                esTeclaIzquierdaPulsada = 0;
            if (estadoteclado.IsKeyUp(Keys.Right))
                esTeclaDerechaPulsada = 0;

            foreach (Keys ekey in teclaspulsada)
            {
                if (ekey == Keys.Down && esTeclaAbajoPulsada == 0)
                {
                    if (mActivo != 0)
                        mActivo--;
                    esTeclaAbajoPulsada = 1;

                }
                if (ekey == Keys.Up && esTeclaArribaPulsada == 0)
                {
                    if (mActivo != 2)
                        mActivo++;
                    esTeclaArribaPulsada = 1;
                }
                if (ekey == Keys.Left && esTeclaIzquierdaPulsada == 0 && mActivo == 2)
                {
                    isFullScreen = !isFullScreen;
                    esTeclaIzquierdaPulsada = 1;
                }
                if (ekey == Keys.Right && esTeclaDerechaPulsada == 0 && mActivo == 2)
                {
                    isFullScreen = !isFullScreen;
                    esTeclaDerechaPulsada = 1;
                }
                if (ekey == Keys.Enter && esEnterPulsado == 0)
                {
                    esEnterPulsado = 1;
                    return mActivo;
                }
            }
            return -1;
        }

        public static void Draw(SpriteBatch sB)
        {
            sB.Draw(Game1.getTexturaMenuFondo(), Vector2.Zero, null, Color.White, 0, Vector2.Zero, 1, SpriteEffects.None, 0);
            if (mActivo == 0)
            {
                sB.DrawString(Game1.getFuenteMenu(), "FULLSCREEN", new Vector2(620, 350), Color.White, 0, new Vector2(0, 0), 0.5f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "APLICAR CAMBIOS", new Vector2(560, 450), Color.White, 0, new Vector2(0, 0), 0.5f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "VOLVER", new Vector2(670, 550), Color.CornflowerBlue, 0, new Vector2(0, 0), 0.5f, SpriteEffects.None, 0);
            }
            if (mActivo == 1)
            {
                sB.DrawString(Game1.getFuenteMenu(), "FULLSCREEN", new Vector2(620, 350), Color.White, 0, new Vector2(0, 0), 0.5f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "APLICAR CAMBIOS", new Vector2(560, 450), Color.CornflowerBlue, 0, new Vector2(0, 0), 0.5f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "VOLVER", new Vector2(670, 550), Color.White, 0, new Vector2(0, 0), 0.5f, SpriteEffects.None, 0);
            }
            if (mActivo == 2)
            {
                sB.DrawString(Game1.getFuenteMenu(), "FULLSCREEN", new Vector2(620, 350), Color.CornflowerBlue, 0, new Vector2(0, 0), 0.5f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "APLICAR CAMBIOS", new Vector2(560, 450), Color.White, 0, new Vector2(0, 0), 0.5f, SpriteEffects.None, 0);
                sB.DrawString(Game1.getFuenteMenu(), "VOLVER", new Vector2(670, 550), Color.White, 0, new Vector2(0, 0), 0.5f, SpriteEffects.None, 0);
            }
            if (isFullScreen)
                sB.DrawString(Game1.getFuenteMenu(), "SI", new Vector2(950, 350), Color.Red, 0, new Vector2(0, 0), 0.5f, SpriteEffects.None, 0);
            else
                sB.DrawString(Game1.getFuenteMenu(), "NO", new Vector2(950, 350), Color.Red, 0, new Vector2(0, 0), 0.5f, SpriteEffects.None, 0);
        }
    }
}
