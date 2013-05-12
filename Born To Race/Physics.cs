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
    static class Physics
    {

        //Deteccion superficies
        private static RenderTarget2D trackRender;
        private static RenderTarget2D trackRenderRotated;

        public static void loadPhysics(GraphicsDeviceManager graphics, Coche coche)
        {
            trackRender = new RenderTarget2D(graphics.GraphicsDevice, coche.getAnchura() + 100, coche.getAltura() + 100, 1, SurfaceFormat.Color);
            trackRenderRotated = new RenderTarget2D(graphics.GraphicsDevice, coche.getAltura() + 100, coche.getAltura() + 100, 1, SurfaceFormat.Color);
        }

        private static Texture2D texturaSuperficie(GraphicsDeviceManager graphics ,SpriteBatch spriteBatch, int nCircuito, Coche coche, float X, float Y)
        {

            graphics.GraphicsDevice.SetRenderTarget(0, trackRender);
            graphics.GraphicsDevice.Clear(ClearOptions.Target, Color.Blue, 0, 0);

            spriteBatch.Begin();
            spriteBatch.Draw(Game1.getTexturaColisiones(nCircuito), new Rectangle(0, 0, coche.getAnchura() + 100, coche.getAltura() + 100), new Rectangle((int)(X - 50), (int)(Y - 50), coche.getAnchura() + 100, coche.getAltura() + 100), Color.White);
            spriteBatch.End();

            graphics.GraphicsDevice.SetRenderTarget(0, null);

            Texture2D superficie = trackRender.GetTexture();

            graphics.GraphicsDevice.SetRenderTarget(0, trackRenderRotated);
            graphics.GraphicsDevice.Clear(ClearOptions.Target, Color.Blue, 0, 0);

            spriteBatch.Begin();
            spriteBatch.Draw(superficie, new Rectangle((int)(superficie.Width / 2), (int)(superficie.Height / 2), superficie.Width, superficie.Height), new Rectangle(0, 0, superficie.Width, superficie.Width), Color.White, -coche.getDireccion(), new Vector2((int)(superficie.Width / 2), (int)(superficie.Height / 2)), SpriteEffects.None, 0);
            spriteBatch.End();

            graphics.GraphicsDevice.SetRenderTarget(0, null);

            return trackRenderRotated.GetTexture();
        }

        public static float deteccionSuperficie(GraphicsDeviceManager graphics, SpriteBatch spriteBatch, int nCircuito, Coche coche)
        {
            float X = (float)(coche.getPosicion().X - coche.getAnchura() / 2 + coche.getVelocidad() * Math.Cos(coche.getDireccion()));
            float Y = (float)(coche.getPosicion().Y - coche.getAltura() / 2 + coche.getVelocidad() * Math.Sin(coche.getDireccion()));
            Texture2D supColision = texturaSuperficie(graphics, spriteBatch, nCircuito, coche, X, Y);

            int nPixels = coche.getAnchura() * coche.getAltura();
            Color[] colores = new Color[nPixels];
            supColision.GetData<Color>(0, new Rectangle((int)(supColision.Width / 2 - coche.getAnchura() / 2), (int)(supColision.Height / 2 - coche.getAltura() / 2), coche.getAnchura(), coche.getAltura()), colores, 0, nPixels);

            float factor = 1; //Factor que no varia la velocidad

            float cArena = 0;
            float cHierba = 0;
            float cAsfalto = 0;
            float cPiano = 0;
            float cTotal = nPixels;

            foreach (Color c in colores)
            {
                if (c == Color.Red)
                    cArena += 1;
                if (c == Color.White)
                    cHierba += 1;
                if (c == Color.Black)
                    cAsfalto += 1;
                if (c == Color.Lime)
                    cPiano += 1;
            }
            cTotal = cAsfalto + cArena + cHierba + cPiano;
            //Calculo del factor de reduccion de velocidad
            factor = 1 * ((cAsfalto + cPiano) / cTotal) + 0.9f * (cArena / cTotal) + 0.98f * (cHierba / cTotal);
            //Console.WriteLine("Total " + cTotal + " Factor " + factor + " Arena " + cArena + " Hierba " + cHierba + " Asfalto " + cAsfalto + " Piano " + cPiano);
            return factor;
        }
    }
}
