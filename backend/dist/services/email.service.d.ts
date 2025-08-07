export interface EmailOptions {
    to: string | string[];
    subject: string;
    html?: string;
    text?: string;
    from?: string;
}
export interface TemplatedEmailOptions {
    to: string | string[];
    templateName: string;
    templateData: Record<string, any>;
    from?: string;
}
export declare class EmailService {
    private static readonly FROM_EMAIL;
    private static readonly FROM_NAME;
    static sendEmail(options: EmailOptions): Promise<void>;
    static sendTemplatedEmail(options: TemplatedEmailOptions): Promise<void>;
    static sendWelcomeEmail(email: string, firstName: string, verificationToken: string): Promise<void>;
    static sendPasswordResetEmail(email: string, firstName: string, resetToken: string): Promise<void>;
    static sendDonationReceiptEmail(email: string, donorName: string, amount: string, campaignTitle: string, donationId: string): Promise<void>;
    static sendCampaignApprovalEmail(email: string, firstName: string, campaignTitle: string, campaignUrl: string): Promise<void>;
}
