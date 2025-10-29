# Stromgedacht Grid Status Monitor for Homey

This Homey app integrates with the Stromgedacht API to monitor the power grid status and forecast for Baden-Württemberg. It helps users optimize their power consumption based on the current grid load and upcoming forecasts.

## Disclaimer

**This is an independent third-party application and is not affiliated with, endorsed by, or connected to TransnetBW GmbH, Stromnetz Berlin GmbH, or their Stromgedacht service.** 

This app is simply a wrapper around the publicly available Stromgedacht API to make grid status information accessible within the Homey ecosystem. All rights to "Stromgedacht", including the name, logos, and content, remain with their respective owners. "Stromgedacht" is a trademark of TransnetBW GmbH and is used here for reference purposes only.

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

This app uses the Stromgedacht API (api.stromgedacht.de) to fetch grid status information. The API provides data primarily for Baden-Württemberg and selected regions in Germany.

**Note:** The Stromgedacht API and all associated content are provided by TransnetBW GmbH and partners. This Homey app only consumes the publicly available API.

## Requirements

- Homey Pro
- Valid German postal code (primarily Baden-Württemberg)
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