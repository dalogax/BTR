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
    public class Game1 : Microsoft.Xna.Framework.Game
    {
        GraphicsDeviceManager graphics;
        SpriteBatch spriteBatch;

        private int estadoJuego = 0; // 0 -> Menu Principal, 1 -> Carrera, 6 -> Menu Opciones

        private Partida partida;
        private const int maxplayers = 4;
        private const int numCircuitos = 5;
        private const int numOpciones = 3;

        //Texturas
        private static Texture2D[] texturasCoche = new Texture2D[maxplayers];
        private static Texture2D[] texturasCircuito = new Texture2D[numCircuitos];
        private static Texture2D[] texturasColisiones = new Texture2D[numCircuitos];
        private static Texture2D texturaMenufondo;
        private static Texture2D[] texturasMenuAzul = new Texture2D[numOpciones]; //Start -> Opciones -> Salir
        private static Texture2D[] texturasMenuBlanco = new Texture2D[numOpciones]; //Start -> Opciones -> Salir
        private static Texture2D[] texturasSemaforo = new Texture2D[5];
        //Fin Texturas

        //Fuentes
        private static SpriteFont fuenteMarcador;
        private static SpriteFont fuenteGanador;
        private static SpriteFont fuenteMenu;
        private static SpriteFont fuenteJugador;
        private static SpriteFont fuenteIntermedio;
        //Fin Texturas

        public Game1()
        {
            graphics = new GraphicsDeviceManager(this);
            Content.RootDirectory = "Content";
        }

        protected void leerRaton() 
        {
            this.IsMouseVisible = true;
            //Console.WriteLine("X: " + Mouse.GetState().X + " Y: " + Mouse.GetState().Y);
        }

        protected void leerTeclado()
        {
            KeyboardState estadoteclado = Keyboard.GetState();

            //Menu
            if (estadoJuego == 0)
            {
                int vTeclado = Menu.leerTeclado(estadoteclado);
                if (vTeclado == 0)
                {
                    estadoJuego = 1;
                    partida = new PartidaUnJugador(4);
                }
                if (vTeclado == 1)
                {
                    estadoJuego = 1;
                    partida = new PartidaMultijugador(2, 4);
                }
                if (vTeclado == 2)
                {
                    estadoJuego = 6;
                    MenuOpciones.resetMenu(graphics.IsFullScreen);
                    return;
                }
                else if (vTeclado == 3)
                    this.Exit();
            }  
            //Menu Opciones
            if (estadoJuego == 6)
            {
                int vTeclado = MenuOpciones.leerTeclado(estadoteclado);
                if (vTeclado == 1)
                {
                    graphics.IsFullScreen = MenuOpciones.getFullScreen();
                    graphics.ApplyChanges();
                }
                if (vTeclado == 0)
                    estadoJuego = 0;
            }
            //Carrera
            if (estadoJuego == 1)
                partida.leerTeclado(estadoteclado);
            if (estadoteclado.IsKeyDown(Keys.Escape))
                estadoJuego = 0;
            //Debug
            if (estadoteclado.IsKeyDown(Keys.F11))
            {
                graphics.IsFullScreen = true;
                graphics.ApplyChanges();
            }
            if (estadoteclado.IsKeyDown(Keys.F9))
                this.Exit();
        }

        public static Texture2D getTexturaCoche(int i)
        {
            return texturasCoche[i];
        }

        public static Texture2D getTexturaCircuito(int i)
        {
            return texturasCircuito[i];
        }

        public static Texture2D getTexturaColisiones(int i)
        {
            return texturasColisiones[i];
        }

        public static Texture2D getTexturaMenuFondo()
        {
            return texturaMenufondo;
        }

        public static Texture2D getTexturaMenuAzul(int i)
        {
            return texturasMenuAzul[i];
        }

        public static Texture2D getTexturaMenuBlanco(int i)
        {
            return texturasMenuBlanco[i];
        }

        public static Texture2D getTexturaSemaforo(int i)
        {
            return texturasSemaforo[i];
        }

        public static SpriteFont getFuenteMarcador()
        {
            return fuenteMarcador;
        }

        public static SpriteFont getFuenteGanador()
        {
            return fuenteGanador;
        }

        public static SpriteFont getFuenteMenu()
        {
            return fuenteMenu;
        }

        public static SpriteFont getFuenteJugador()
        {
            return fuenteJugador;
        }

        public static SpriteFont getFuenteIntermedio()
        {
            return fuenteIntermedio;
        }

        protected override void Initialize()
        {
            base.Initialize();
        }

        protected override void LoadContent()
        {
            spriteBatch = new SpriteBatch(GraphicsDevice);
            //TEXTURAS DE MENU
            //Cargamos la textura del menu
            texturaMenufondo = Content.Load<Texture2D>("Texturas/Menu/menu_fondo");

            //TEXTURAS DE CARRERA
            //Cargamos las texturas del semaforo
            for (int i = 0; i < 5; i++)
                texturasSemaforo[i] = Content.Load<Texture2D>("Texturas/Semaforo/semaforo" + i);

            //Cargamos las texturas de los circuitos
            for (int i = 0; i < numCircuitos; i++)
            {
                texturasCircuito[i] = Content.Load<Texture2D>("Texturas/Circuitos/circuito" + i);
                texturasColisiones[i] = Content.Load<Texture2D>("Texturas/Circuitos/circuitoColisiones" + i);
            }
                                        
            //Cargamos las texturas de los coches
            for(int i = 0; i < 2; i++) //PARA DOS COCHES !!!!
                texturasCoche[i] = Content.Load<Texture2D>("Texturas/Coches/coche" + i);

            //Cargamos las fisicas del circuito
            //partida.cargarFisicas(graphics);

            //Cargamos las fuentes
            fuenteMarcador = Content.Load<SpriteFont>("Fuentes/Shift");
            fuenteGanador = Content.Load<SpriteFont>("Fuentes/Impact");
            fuenteMenu = Content.Load<SpriteFont>("Fuentes/Disko");
            fuenteJugador = Content.Load<SpriteFont>("Fuentes/BankGothic");
            fuenteIntermedio = Content.Load<SpriteFont>("Fuentes/SofaChrome");

            //Establecemos la resolucion de la pantalla de juego
            graphics.PreferredBackBufferWidth = 1024;
            graphics.PreferredBackBufferHeight = 768;
            graphics.ApplyChanges();
        }

        protected override void UnloadContent()
        {
        }

        protected override void Update(GameTime gameTime)
        {
            if (GamePad.GetState(PlayerIndex.One).Buttons.Back == ButtonState.Pressed)
                this.Exit();

            leerRaton();
            leerTeclado();
            if (estadoJuego == 1)
            {
                partida.cargarFisicas(graphics);
                if (partida.principal(spriteBatch, graphics) == 3)
                    estadoJuego = 0;
            }
            base.Update(gameTime);
        }

        protected override void Draw(GameTime gameTime)
        {
            GraphicsDevice.Clear(Color.CornflowerBlue);
            spriteBatch.Begin(SpriteBlendMode.AlphaBlend);
            if (estadoJuego == 0)
                Menu.Draw(spriteBatch);
            if (estadoJuego == 1)
                partida.Draw(spriteBatch);
            if (estadoJuego == 6)
                MenuOpciones.Draw(spriteBatch);
            spriteBatch.End();
            base.Draw(gameTime);
        }
    }
}
