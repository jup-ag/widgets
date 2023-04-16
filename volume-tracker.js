let interval = args.widgetParameter;
// Validate interval
if (
  (interval === undefined || ["day", "week", "month"].indexOf(interval)) === -1
) {
  interval = "day";
}

let intervalLabel;
switch (interval) {
  case "day":
    intervalLabel = " 24H";
    break;
  case "week":
    intervalLabel = " 7D";
    break;
  case "month":
    intervalLabel = " 30D";
    break;
}

// Jupiter Stats API
const apiUrl = "https://stats.jup.ag/info/" + interval;

let widget = await createWidget();
if (!config.runsInWidget) {
  await widget.presentMedium();
}

Script.setWidget(widget);
Script.complete();

async function createWidget() {
  const widget = new ListWidget();
  widget.refreshAfterDate = new Date(Date.now() + 600 * 1000);

  const backgroundColor = new Color("#2C2C32");
  widget.backgroundColor = backgroundColor;

  let data;
  try {
    let r = new Request(apiUrl);
    data = data = await r.loadJSON();
  } catch (e) {}

  const headerColor = new Color("#969699");

  // Volume
  const volumeHeader = widget.addText("Jupiter Volume" + intervalLabel);
  volumeHeader.font = Font.mediumSystemFont(12);
  volumeHeader.textColor = headerColor;
  const volume = widget.addText("$" + formatMoney(data.lastXVolumeInUSD, 0));
  volume.font = Font.boldSystemFont(36);

  const totalVolume = widget.addText(
    "$" + formatMoney(data.totalVolumeInUSD, 0)
  );
  totalVolume.font = Font.mediumSystemFont(16);
  totalVolume.textColor = headerColor;

  widget.addSpacer(12);

  const footer = widget.addStack();
  footer.layoutHorizontally();

  const transactionsStack = footer.addStack();
  transactionsStack.layoutVertically();

  // Transactions
  const transactionsHeader = transactionsStack.addText(
    "Transactions" + intervalLabel
  );
  transactionsHeader.font = Font.mediumSystemFont(12);
  transactionsHeader.textColor = headerColor;
  const transactions = transactionsStack.addText(
    formatMoney(data.lastXTransactionsCount, 0)
  );
  transactions.font = Font.boldSystemFont(16);

  footer.addSpacer(48);

  const addressesStack = footer.addStack();
  addressesStack.layoutVertically();

  // Addresses
  const addressesHeader = addressesStack.addText("Uniques" + intervalLabel);
  addressesHeader.font = Font.mediumSystemFont(12);
  addressesHeader.textColor = headerColor;
  const addresses = addressesStack.addText(
    formatMoney(data.lastXAddressesCount, 0)
  );
  addresses.font = Font.boldSystemFont(16);

  return widget;
}

function formatMoney(amount, decimalCount = 2, decimal = ".", thousands = ",") {
  try {
    decimalCount = Math.abs(decimalCount);
    decimalCount = isNaN(decimalCount) ? 2 : decimalCount;

    const negativeSign = amount < 0 ? "-" : "";

    let i = parseInt(
      (amount = Math.abs(Number(amount) || 0).toFixed(decimalCount))
    ).toString();
    let j = i.length > 3 ? i.length % 3 : 0;

    return (
      negativeSign +
      (j ? i.substr(0, j) + thousands : "") +
      i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + thousands) +
      (decimalCount
        ? decimal +
          Math.abs(amount - i)
            .toFixed(decimalCount)
            .slice(2)
        : "")
    );
  } catch (e) {
    console.log(e);
  }
}
