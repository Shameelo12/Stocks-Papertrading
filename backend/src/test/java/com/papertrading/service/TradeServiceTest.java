package com.papertrading.service;

import com.papertrading.dto.TradeRequest;
import com.papertrading.model.Holding;
import com.papertrading.model.User;
import com.papertrading.repository.HoldingRepository;
import com.papertrading.repository.TransactionRepository;
import com.papertrading.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TradeServiceTest {

    @Mock
    private HoldingRepository holdingRepository;

    @Mock
    private TransactionRepository transactionRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AlphaVantageService alphaVantageService;

    @InjectMocks
    private TradeService tradeService;

    private User testUser;
    private TradeRequest buyRequest;

    @BeforeEach
    void setUp() {
        testUser = new User("test@example.com", "password");
        testUser.setId("user-1");
        testUser.setBalance(new BigDecimal("10000.00"));

        buyRequest = new TradeRequest("AAPL", new BigDecimal("10"));
    }

    @Test
    void testBuySuccessNewHolding() {
        when(alphaVantageService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("150.00")));
        when(holdingRepository.findByUserAndTicker(testUser, "AAPL")).thenReturn(Optional.empty());
        when(holdingRepository.save(any(Holding.class))).thenReturn(new Holding(testUser, "AAPL", new BigDecimal("10"), new BigDecimal("150.00")));
        when(userRepository.save(testUser)).thenReturn(testUser);

        Holding result = tradeService.buy(testUser, buyRequest);

        assertNotNull(result);
        assertEquals(new BigDecimal("8500.00"), testUser.getBalance());
        verify(userRepository, times(1)).save(testUser);
        verify(transactionRepository, times(1)).save(any());
    }

    @Test
    void testBuyInsufficientBalance() {
        testUser.setBalance(new BigDecimal("1000.00"));
        when(alphaVantageService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("150.00")));

        assertThrows(IllegalArgumentException.class, () -> tradeService.buy(testUser, buyRequest));
    }

    @Test
    void testBuyPriceUnavailable() {
        when(alphaVantageService.getCurrentPrice("AAPL")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> tradeService.buy(testUser, buyRequest));
    }

    @Test
    void testBuyInvalidShares() {
        TradeRequest invalidRequest = new TradeRequest("AAPL", new BigDecimal("0"));

        assertThrows(IllegalArgumentException.class, () -> tradeService.buy(testUser, invalidRequest));
    }

    @Test
    void testSellSuccessPartialPosition() {
        Holding holding = new Holding(testUser, "AAPL", new BigDecimal("20"), new BigDecimal("150.00"));
        TradeRequest sellRequest = new TradeRequest("AAPL", new BigDecimal("10"));

        when(holdingRepository.findByUserAndTicker(testUser, "AAPL")).thenReturn(Optional.of(holding));
        when(alphaVantageService.getCurrentPrice("AAPL")).thenReturn(Optional.of(new BigDecimal("155.00")));
        when(holdingRepository.save(any(Holding.class))).thenReturn(new Holding(testUser, "AAPL", new BigDecimal("10"), new BigDecimal("150.00")));
        when(userRepository.save(testUser)).thenReturn(testUser);

        tradeService.sell(testUser, sellRequest);

        assertEquals(new BigDecimal("11550.00"), testUser.getBalance());
        verify(userRepository, times(1)).save(testUser);
        verify(transactionRepository, times(1)).save(any());
    }

    @Test
    void testSellNoPosition() {
        TradeRequest sellRequest = new TradeRequest("AAPL", new BigDecimal("10"));

        when(holdingRepository.findByUserAndTicker(testUser, "AAPL")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () -> tradeService.sell(testUser, sellRequest));
    }

    @Test
    void testSellInsufficientShares() {
        Holding holding = new Holding(testUser, "AAPL", new BigDecimal("5"), new BigDecimal("150.00"));
        TradeRequest sellRequest = new TradeRequest("AAPL", new BigDecimal("10"));

        when(holdingRepository.findByUserAndTicker(testUser, "AAPL")).thenReturn(Optional.of(holding));

        assertThrows(IllegalArgumentException.class, () -> tradeService.sell(testUser, sellRequest));
    }
}
