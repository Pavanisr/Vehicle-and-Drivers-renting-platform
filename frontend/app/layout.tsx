import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapClient from "../components/BootstrapClient";

export const metadata = {
  title: "Vehicle Rental",
  description: "Vehicle Rental Platform",
};

export default function RootLayout({ children }: any) {
  return (
    <html lang="en">
      <body>
        <BootstrapClient />
        {children}
      </body>
    </html>
  );
}
