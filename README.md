# Stromgedacht Grid Status Monitor for Homey

This Homey app integrates with the Stromgedacht API to monitor the power grid status and forecast. It helps users optimize their power consumption based on the current grid load and upcoming forecasts.

## Features

- Real-time monitoring of current grid status
- 6-hour forecast of grid status
- 24-hour forecast of grid status
- Automatic updates every 10 minutes
- Flow support for status changes
- Multi-language support (English, German, Dutch, Spanish)

## Grid Status Indicators

The app uses four different states to indicate grid status:

- 🟦 **SUPER GREEN** - Ideal time for power consumption
- 🟩 **GREEN** - Good time for power consumption
- 🟨 **YELLOW** - Try to reduce power consumption
- 🟥 **RED** - Critical grid load, avoid power consumption if possible

## Installation

1. Install the app from the Homey App Store
2. Add a new Grid Status Monitor device
3. Enter your postal code (ZIP) during device setup
4. The device will start monitoring the grid status for your region

## Flow Support

### Triggers
- When current grid status changes
- When 6-hour forecast changes
- When 24-hour forecast changes

Each trigger can be configured to fire only for specific status changes (Super Green, Green, Yellow, or Red).

## API Information

This app uses the Stromgedacht API (api.stromgedacht.de) to fetch grid status information. The API provides data for regions within Germany.

## Requirements

- Homey Pro
- Valid German postal code
- Internet connection

## Support

If you encounter any issues or have questions:
- Check the [Homey Community](https://community.homey.app)
- Open an issue on [GitHub](https://github.com/j0er9/org.j0er9.homey.stromgedacht/issues)

## Privacy

This app only sends your postal code to the Stromgedacht API to retrieve grid status information. No personal data is collected or stored.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Credits

- Grid status data provided by [Stromgedacht](https://www.stromgedacht.de)
- App icon and design elements follow Homey guidelines