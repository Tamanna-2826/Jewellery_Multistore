const PDFDocument = require('pdfkit');
const fs = require('fs');
const stripe = require('stripe')('your_stripe_secret_key');

const generateInvoice = async (invoiceId) => {
  try {
    // Fetch the invoice from Stripe
    const invoice = await stripe.invoices.retrieve(invoiceId);

    // Create a PDF document
    const doc = new PDFDocument();
    const filePath = `./invoices/${invoiceId}.pdf`;
    doc.pipe(fs.createWriteStream(filePath));

    // Customize the PDF with your data
    doc.fontSize(25).text('Invoice', { align: 'center' });
    doc.text(`Invoice ID: ${invoice.id}`);
    doc.text(`Amount: ${invoice.amount_due / 100} ${invoice.currency.toUpperCase()}`);
    doc.text(`Customer: ${invoice.customer_email}`);
    doc.text(`Description: ${invoice.description}`);
    // Add more customized content as needed

    doc.end();

    return filePath;
  } catch (error) {
    console.error('Error generating invoice:', error);
    throw new Error('Error generating invoice');
  }
};

const downloadInvoice = async (req, res) => {
  const { invoiceId } = req.params;

  try {
    const filePath = await generateInvoice(invoiceId);

    // Send the file as a response
    res.download(filePath, `${invoiceId}.pdf`, (err) => {
      if (err) {
        console.error('Error sending the file:', err);
      }
      // Optionally delete the file after sending
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).send('Error downloading invoice');
  }
};

module.exports = { downloadInvoice };
