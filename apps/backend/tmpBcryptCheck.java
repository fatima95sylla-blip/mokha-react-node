import org.springframework.security.crypto.bcrypt.BCrypt; 
public class BcryptCheck { public static void main(String[] args) { String hash = "$2a$12$wPGYE1vFgDAYc9dvZd9P6OyDRnbJByXPEjpSh20ezDd56BiGcpuS6"; System.out.println(BCrypt.checkpw("Admin123!", hash)); System.out.println(BCrypt.checkpw("Mokha@123!", hash)); System.out.println(BCrypt.checkpw("Admin123", hash)); } }
