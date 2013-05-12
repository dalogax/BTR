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
    class Coche
    {
        private Vector2 posicion;
        private float velocidad;
        private float velocidadMax;
        private float aceleracion;
        private float frenado;
        private float direccion;
        private float giro;
        private int numCoche;
        private BoundingBox bBox;


        public Coche(int n)
        {
            posicion = new Vector2(0, 0); //Se inicializar la posicion de coche a 0, no a la posicion de la parrilla
            velocidad = 0;
            velocidadMax = 6; //Rango correcto (3 - 6) Valor por defecto 5
            aceleracion = 2; //Rango correcto (0.2 - 2) Valor por defecto 1
            frenado = 1; //Rango correcto (0.6 - 1.8) Valor por defecto 1
            giro = 1; //Rango correcto (0.8 - 1.5) Valor por defecto 1
            direccion = (float)Math.PI;
            numCoche = n;
        }

        public void mover(int x, int y)
        {
            posicion.X = x;
            posicion.Y = y;
            velocidad = 0;
            direccion = (float)Math.PI;
        }

        public void setDireccion(float d) 
        {
            direccion = d;
        }

        public Vector2 getPosicion()
        {
            return posicion;
        }

        public float getVelocidad()
        {
            return velocidad;
        }

        public float getVelocidadMax()
        {
            return velocidadMax;
        }

        public float getAcelearacion()
        {
            return aceleracion;
        }

        public float getFrenado()
        {
            return frenado;
        }

        public float getDireccion()
        {
            return direccion;
        }

        public float getGiro()
        {
            return giro;
        }

        public int getAltura()
        {
            return Game1.getTexturaCoche(numCoche).Height;
        }

        public int getAnchura()
        {
            return Game1.getTexturaCoche(numCoche).Width;
        }

        public BoundingBox getBBox()
        {
            return bBox;
        }

        public void actualizar(float reduccion)
        {
            Vector2 pAnterior;
            pAnterior.X = posicion.X;
            pAnterior.Y = posicion.Y;
            velocidad = velocidad * reduccion;
            posicion.X += ((float)Math.Cos(direccion)) * velocidad;
            posicion.Y += ((float)Math.Sin(direccion)) * velocidad;
            if ((posicion.X > 1015) || (posicion.X < 10) || (posicion.Y > 760) || (posicion.Y < 10))
            {
                posicion.X = pAnterior.X;
                posicion.Y = pAnterior.Y;
                velocidad = 0;
            }
            // Mal calculadas las esquinas del Bbox
            bBox = new BoundingBox(new Vector3(posicion.X - getAltura(), posicion.Y - getAnchura(), 0), new Vector3(posicion.X + getAltura(), posicion.Y + getAnchura(), 0));
        }

        public void girar(float ladoGiro)
        {
            //Girar marcha adelante
            if (velocidad > 0 && velocidad < (0.03 * velocidadMax))
                direccion += giro * 0.01f * ladoGiro;
            else if (velocidad >= (0.03 * velocidadMax) && velocidad < (0.07 * velocidadMax))
                direccion += giro * 0.02f * ladoGiro;
            else if (velocidad >= (0.07 * velocidadMax) && velocidad < (0.1 * velocidadMax))
                direccion += giro * 0.03f * ladoGiro;
            else if (velocidad >= (0.1 * velocidadMax) && velocidad < (0.2 * velocidadMax))
                direccion += giro * 0.04f * ladoGiro;
            else if (velocidad >= (0.2 * velocidadMax) && velocidad < (0.4 * velocidadMax))
                direccion += giro * 0.035f * ladoGiro;
            else if (velocidad >= (0.4 * velocidadMax) && velocidad < (0.6 * velocidadMax))
                direccion += giro * 0.03f * ladoGiro;
            else if (velocidad >= (0.6 * velocidadMax) && velocidad < (0.8 * velocidadMax))
                direccion += giro * 0.025f * ladoGiro;
            else if (velocidad >= (0.8 * velocidadMax))
                direccion += giro * 0.02f * ladoGiro;
            //Girar marcha atras
            else if (velocidad >= -(0.04 * velocidadMax) && velocidad < 0)
                direccion -= giro * 0.02f * ladoGiro;
            else if (velocidad >= -(0.08 * velocidadMax) && velocidad < -(0.04 * velocidadMax))
                direccion -= giro * 0.03f * ladoGiro;
            else if (velocidad >= -(0.12 * velocidadMax) && velocidad < -(0.08 * velocidadMax))
                direccion -= giro * 0.04f * ladoGiro;
            else if (velocidad < -(0.12 * velocidadMax))
                direccion -= giro * 0.05f * ladoGiro;
            //Deceleracion debido al giro
            if (velocidad >= (0.1 * velocidadMax) && velocidad < (0.2 * velocidadMax))
                velocidad -= 0.002f;
            else if (velocidad >= (0.2 * velocidadMax) && velocidad < (0.4 * velocidadMax))
                velocidad -= 0.004f;
            else if (velocidad >= (0.4 * velocidadMax) && velocidad < (0.6 * velocidadMax))
                velocidad -= 0.006f;
            else if (velocidad >= (0.6 * velocidadMax) && velocidad < (0.8 * velocidadMax))
                velocidad -=  0.008f;
            else if (velocidad >= (0.8 * velocidadMax) && velocidad <= velocidadMax)
                velocidad -= 0.01f;
        }

        public void acelerar()
        {
            if (velocidad < (0.1 * velocidadMax))
                velocidad += aceleracion * 0.05f;
            else if (velocidad >= (0.1 * velocidadMax) && velocidad < (0.2 * velocidadMax))
                velocidad += aceleracion * 0.025f;
            else if (velocidad >= (0.2 * velocidadMax) && velocidad < (0.4 * velocidadMax))
                velocidad += aceleracion * 0.015f;
            else if (velocidad >= (0.4 * velocidadMax) && velocidad < (0.6 * velocidadMax))
                velocidad += aceleracion * 0.01f;
            else if (velocidad >= (0.6 * velocidadMax) && velocidad < (0.8 * velocidadMax))
                velocidad += aceleracion * 0.005f;
            else if (velocidad >= (0.8 * velocidadMax) && velocidad < velocidadMax)
                velocidad += aceleracion * 0.0025f;
            //Velocidad maxima
            else if (velocidad >= velocidadMax)
                velocidad = velocidadMax;
        }

        public void frenar()
        {
            //Frenar
            if (velocidad >= (0.8 * velocidadMax))
                velocidad -= frenado * 0.2f;
            else if (velocidad >= (0.6 * velocidadMax) && velocidad < (0.8 * velocidadMax))
                velocidad -= frenado * 0.15f;
            else if (velocidad >= (0.4 * velocidadMax) && velocidad < (0.6 * velocidadMax))
                velocidad -= frenado * 0.1f;
            else if (velocidad >= (0.2 * velocidadMax) && velocidad < (0.4 * velocidadMax))
                velocidad -= frenado * 0.05f;
            else if (velocidad >= (0.1 * velocidadMax) && velocidad < (0.2 * velocidadMax))
                velocidad -= frenado * 0.025f;
            else if (velocidad >= (0.05 * velocidadMax) && velocidad < (0.1 * velocidadMax))
                velocidad -= frenado * 0.02f;
            //Parar
            else if (velocidad < (0.05 * velocidadMax) && velocidad > 0)
                velocidad = 0;
            //Marcha atras
            else if (velocidad <= 0 && velocidad >= -(0.04 * velocidadMax))
                velocidad -= frenado * 0.02f;
            else if (velocidad < -(0.04 * velocidadMax) && velocidad >= -(0.08 * velocidadMax))
                velocidad -= frenado * 0.025f;
            else if (velocidad < -(0.08 * velocidadMax) && velocidad > -(0.16 * velocidadMax))
                velocidad -= frenado * 0.03f;
            //Velocidad maxima marcha atras
            else if (velocidad <= -(0.16 * velocidadMax))
                velocidad = -(0.16f * velocidadMax);

        }

        public void aminorar()
        {
            if (velocidad >= (0.8 * velocidadMax))
                velocidad -= 0.15f;
            else if (velocidad >= (0.6 * velocidadMax) && velocidad < (0.8 * velocidadMax))
                velocidad -= 0.1f;
            else if (velocidad >= (0.4 * velocidadMax) && velocidad < (0.6 * velocidadMax))
                velocidad -= 0.05f;
            else if (velocidad >= (0.2 * velocidadMax) && velocidad < (0.4 * velocidadMax))
                velocidad -= 0.02f;
            else if (velocidad >= (0.1 * velocidadMax) && velocidad < (0.2 * velocidadMax))
                velocidad -= 0.01f;
            else if (velocidad >= (0.04 * velocidadMax) && velocidad < (0.1 * velocidadMax))
                velocidad -= 0.005f;
            else if (velocidad < (0.04 * velocidadMax) && velocidad >= -(0.04 * velocidadMax))
                velocidad = 0;
            else if (velocidad < -(0.04 * velocidadMax) && velocidad >= -(0.1 * velocidadMax))
                velocidad += 0.02f;
            else if (velocidad < -(0.1 * velocidadMax))
                velocidad += 0.1f;
        }

        public void Draw(SpriteBatch sB)
        {
            sB.Draw(Game1.getTexturaCoche(numCoche), posicion, null, Color.White, direccion, new Vector2(Game1.getTexturaCoche(numCoche).Width / 2, Game1.getTexturaCoche(numCoche).Height / 2), 1f, SpriteEffects.None, 1);
        }
    }
}
