import {
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { AppLoggerService } from '@app/logger/logger.service';
import { GlobalHttpException } from '@app/common/filters/error-http-exception';
import { EMAIL_MESSAGE } from '@app/common/constants/constants';

/**
 * @class EmailService
 * @description A centralized service for handling all email-sending functionalities within the application.
 * It configures and uses a `nodemailer` transporter to send various types of emails,
 * such as OTPs, password notifications, and contact form submissions.
 */
@Injectable()
export class EmailService {
  /** @private A nodemailer transporter instance configured for sending emails. */
  private transporter: nodemailer.Transporter;
  /** @private The company's internal email address for receiving contact form submissions. */
  private companyContactEmail: string;

  /**
   * @constructor
   * @param {ConfigService} configService - Injects the service to access environment variables and application configuration.
   * @param {AppLoggerService} loggerService - Injects the service for application-wide logging.
   */
  constructor(
    private configService: ConfigService,
    private readonly loggerService: AppLoggerService,
  ) {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: false, // Use `true` if your port is 465, `false` for 587, etc.
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      from: process.env.EMAIL_FROM,
    });
    this.companyContactEmail = this.configService.get<string>('COMPANY_CONTACT_EMAIL')!;
  }

  /**
   * @method sendOtpEmail
   * @description Compiles and sends a standardized HTML email containing a One-Time Password (OTP) for user verification.
   * @param {string} to - The email address of the recipient.
   * @param {string} otp - The OTP code to be included in the email.
   * @returns {Promise<void>} A promise that resolves when the email has been sent successfully.
   * @throws {HttpException} Throws an `INTERNAL_SERVER_ERROR` if the email transporter fails to send the email.
   */
  async sendOtpEmail(to: string, otp: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: EMAIL_MESSAGE.SUBJECT,
      html: `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Verification Code</title>
        <style>
          /* ... styles ... */
        </style>
      </head>
      <body>
        <div class="container">
          <p>Dear User,</p>
          <p>Your verification code is:</p>
          <p class="otp">${otp}</p>
          <p>Please enter this code to complete your verification process. It will expire in <strong>10 minutes</strong>.</p>
          <p>Best regards,<br><strong>Meril Private Limited</strong></p>
        </div>
      </body>
      </html>`,
    };
    try {
      await this.transporter.sendMail(mailOptions);
      this.loggerService.log(`OTP email sent successfully to ${to}`);
    } catch (error) {
      this.loggerService.error(`Failed to send OTP email to ${to}`, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to send email',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * @method sendDefaultPasswordEmail
   * @description Sends a welcome email containing a temporary password to a new user.
   * This is typically used when an administrator creates an account on behalf of a user.
   * @param {string} to - The email address of the new user.
   * @param {string} password - The temporary password for the user's initial login.
   * @returns {Promise<void>} A promise that resolves when the email has been sent.
   * @throws {HttpException} Throws an `INTERNAL_SERVER_ERROR` if sending the email fails.
   */
  async sendDefaultPasswordEmail(to: string, password: string): Promise<void> {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject: 'Your Account Credentials',
      html: `<!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Welcome to NuroVision</title>
          <style>
            /* ... styles ... */
          </style>
        </head>
        <body>
          <div class="container">
            <p>Welcome to <strong>NuroVision</strong>!</p>
            <p>Your account has been created. Your temporary password is:</p>
            <p class="password">${password}</p>
            <p>Best regards,<br><strong>HealthJini</strong></p>
          </div>
        </body>
        </html>`,
    };
  
    try {
      await this.transporter.sendMail(mailOptions);
      this.loggerService.log(`Default password email sent successfully to ${to}`);
    } catch (error) {
      this.loggerService.error(`Failed to send default password email to ${to}`, error.stack);
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Failed to send email',
          details: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * @method sendContactFormEmail
   * @description Forwards a user's submission from the website's contact form to a pre-configured company email address.
   * The `replyTo` header is set to the user's email, enabling direct replies.
   * @param {string} name - The name of the person who submitted the form.
   * @param {string} userEmail - The email address of the submitter, used for the `replyTo` field.
   * @param {string} subject - The subject line for the email.
   * @param {string} message - The content of the user's message.
   * @returns {Promise<void>} A promise that resolves upon successful sending.
   * @throws {GlobalHttpException} Throws an `INTERNAL_SERVER_ERROR` if the email fails to send.
   */
  async sendContactFormEmail(
    name: string,
    userEmail: string,
    subject: string ,
    message: string,
  ): Promise<void> {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_FROM'), // From your system's configured email
      to: this.companyContactEmail, // Send to your company's email
      replyTo: userEmail, // When you reply, it goes to the user's actual email
      subject: subject,
      html: `<!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>New Contact Form Submission</title>
        <style>
          /* ... styles ... */
        </style>
      </head>
      <body>
        <div class="container">
          <h2>New Contact Form Submission</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${userEmail}</p>
          <p><strong>Message:</strong></p>
          <p>${message}</p>
        </div>
      </body>
      </html>`,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.loggerService.log(`Contact form email sent successfully to ${this.companyContactEmail} from ${userEmail}`);
    } catch (error) {
      this.loggerService.error(`Failed to send contact form email from ${userEmail}: ${error.message}`, error.stack);
      throw new GlobalHttpException(HttpStatus.INTERNAL_SERVER_ERROR, "Error occurred while sending the contact submission", error.message);
    }
  }

  /**
   * @method verifyConnection
   * @description Verifies the connection and authentication with the configured SMTP server.
   * This is a diagnostic method typically used on application startup to ensure the email service is operational.
   * @returns {Promise<void>} A promise that resolves if the connection is successful.
   * @throws {Error} Throws a standard `Error` if the transporter cannot verify the connection to the email server.
   */
  async verifyConnection(): Promise<void> {
    try {
      await this.transporter.verify();
      this.loggerService.log('Email server connection verified successfully.');
    } catch (error) {
      this.loggerService.error('Failed to verify email server connection', error.stack);
      throw new Error('Failed to verify email server connection');
    }
  }
}