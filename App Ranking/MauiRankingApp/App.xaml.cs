using Microsoft.Maui.Controls;
using MauiRankingApp.Views;

namespace MauiRankingApp
{
    public partial class App : Application
    {
        public App()
        {
            InitializeComponent();
            MainPage = new NavigationPage(new MainPage());
        }
    }
}